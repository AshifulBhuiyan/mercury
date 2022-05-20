/* eslint-disable import/no-cycle */
import {
    createSlice,
    AnyAction,
    Dispatch,
    PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { toast } from "react-toastify";
import { getSessionId } from '../utils';
import { setSlidesHash } from '../components/Notebooks/notebooksSlice';

export interface ITask {
    id: number;
    task_id: string;
    session_id: string;
    created_at: Date;
    state: "CREATED" | "RECEIVED" | "DONE" | "ERROR";
    params: string;
    result: string;
}

const initialState = {
    currentTask: {} as ITask,
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setCurrentTask(state, action: PayloadAction<ITask>) {
            state.currentTask = action.payload;
        },
    },
});

export default tasksSlice.reducer;

export const {
    setCurrentTask
} = tasksSlice.actions;

export const getCurrentTask = (state: RootState) => state.tasks.currentTask;


export const fetchCurrentTask =
    (notebookId: Number) =>
        async (dispatch: Dispatch<AnyAction>) => {

            const sessionId = getSessionId();

            try {
                const url = `/api/v1/latest_task/${notebookId}/${sessionId}`;
                const { data } = await axios.get(url);
                dispatch(setCurrentTask(data))

            } catch (error) {
                // console.clear();
                dispatch(setCurrentTask({} as ITask));
            }

        };

const scrapeSlidesHash = () => {
    try {
        const iframeElement = (document.getElementById("main-iframe") as HTMLIFrameElement)
        const hash = iframeElement?.contentWindow?.location?.hash;
        if (hash) {
            return hash;
        }
    } catch (error) { }
    return "";
}


export const executeNotebook =
    (notebookId: Number) =>
        async (dispatch: Dispatch<AnyAction>, getState: () => any) => {
            const { widgets } = getState().widgets;
            const sessionId = getSessionId();

            const slidesHash = scrapeSlidesHash();
            dispatch(setSlidesHash(slidesHash));

            try {
                const task = {
                    session_id: sessionId,
                    params: JSON.stringify(widgets),
                }
                const url = `/api/v1/execute/${notebookId}`;
                const { data } = await axios.post(url, task);
                dispatch(setCurrentTask(data))

            } catch (error) {
                console.error(`Problem during notebook execution. ${error}`);
            }

        };


export const clearTasks =
    (notebookId: Number) =>
        async (dispatch: Dispatch<AnyAction>) => {
            try {
                const sessionId = getSessionId();
                const url = `/api/v1/clear_tasks/${notebookId}/${sessionId}`;
                await axios.post(url);
                dispatch(setCurrentTask({} as ITask));
                toast.success("All previous tasks deleted. The default view of the app is displayed.")
            } catch (error) {
                toast.error(`Trying to clear previous tasks. The error occured. ${error}`)
            }
        };


export const exportToPDF =
    (notebookId: Number, notebookPath: String, notebookTitle: String) =>
        async (dispatch: Dispatch<AnyAction>) => {
            try {

                toast.info("The PDF export has been started. The file download will start automatically. Please wait ...", {autoClose: 10000});

                const sessionId = getSessionId();
                const url = `/api/v1/export_pdf/`;
                const data = {
                    session_id: sessionId,
                    notebook_id: notebookId,
                    notebook_path: notebookPath,
                    notebook_title: notebookTitle,
                }
                await axios.post(url, data);

                

            } catch (error) {
                toast.error(`The error occured during PDF export. ${error}`)
            }
        };
