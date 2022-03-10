import os
import tempfile

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.test import TestCase
from pro.accounts.models import Membership, MercuryGroup
from rest_framework.reverse import reverse

from apps.notebooks.models import Notebook
from apps.notebooks.tasks import task_init_notebook
from apps.notebooks.tests import create_notebook_with_yaml
from apps.tasks.models import Task
from apps.tasks.tasks import task_execute

# python manage.py test apps.tasks.tests -v 2



class ExecuteNotebookTestCase(TestCase):
    def setUp(self):

        task_init_notebook(
            "apps/notebooks/fixtures/third_notebook.ipynb", render_html=False
        )

    def test_task_execute_notebook(self):

        Task.objects.create(notebook_id=1, session_id="test")

        job_params = {
            "db_id": 1,
        }

        task_execute(job_params)


class ExecuteNotebookAuthorizationTestCase(TestCase):
    def test_check_private(self):
        yaml = """---
share: private
---"""
        with tempfile.NamedTemporaryFile() as tmp:
            create_notebook_with_yaml(tmp.name + ".ipynb", yaml=yaml)
            task_init_notebook(tmp.name + ".ipynb")

        # create user and login
        user = {
            "username": "piotrek",
            "password": "verysecret",
        }
        User.objects.create_user(username=user["username"], password=user["password"])
        response = self.client.post(
            reverse("rest_login"), user, content_type="application/json"
        )
        token = response.json()["key"]
        headers = {"HTTP_AUTHORIZATION": "Token " + token}

        # try to execute the notebook as anonymous user
        params = {"session_id": "some_session_id", "params": {}}
        response = self.client.post("/api/v1/execute/1", params)
        self.assertEqual(response.status_code, 404)

        # try to execute the notebook as logged user
        params = {"session_id": "some_session_id", "params": {}}
        response = self.client.post("/api/v1/execute/1", params, **headers)
        self.assertEqual(response.status_code, 201)

        task = Task.objects.get(pk=1)
        self.assertEqual(task.notebook.id, 1)
