/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import axios from "axios";
import useWindowDimensions from "./WindowDimensions";

import BlockUi from "react-block-ui";
import { useSelector } from "react-redux";
import { getNotebookSrc, getIndexCss, getThemeLightCss } from "../websocket/wsSlice";

type MainViewProps = {
  loadingState: string;
  notebookPath: string;
  waiting: boolean;
  errorMsg: string;
  watchMode: boolean;
  displayEmbed: boolean;
  isPro: boolean;
  username: string;
  slidesHash: string;
  columnsWidth: number;
};

export default function MainView({
  loadingState,
  notebookPath,
  waiting,
  errorMsg,
  watchMode,
  displayEmbed,
  isPro,
  username,
  slidesHash,
  columnsWidth,
}: MainViewProps) {
  const { height } = useWindowDimensions();

  const iframeHeight = displayEmbed ? height - 10 : height - 58;

  //const indexCss = useSelector(getIndexCss);
  //const themeLightCss = useSelector(getThemeLightCss);
  let notebookSrc = useSelector(getNotebookSrc);
  //notebookSrc = notebookSrc.replace("/* empty index.css */", indexCss);
  //notebookSrc = notebookSrc.replace("/* empty theme-light.css */", themeLightCss);
  
  console.log(notebookSrc)

  return (
    <main
      className={`ms-sm-auto col-lg-${columnsWidth}`}
      style={{ paddingTop: "0px", paddingRight: "0px", paddingLeft: "0px" }}
    >
      <BlockUi tag="div" blocking={waiting}>
        <div>
          {loadingState === "loading" && !watchMode && (
            <p>Loading notebook. Please wait ...</p>
          )}
          {loadingState === "error" && !isPro && (
            <p style={{ margin: "20px" }}>
              Problem while loading notebook. Please try again later or contact
              Mercury administrator.
            </p>
          )}

          {loadingState === "error" && isPro && username === "" && (
            <p style={{ margin: "20px" }}>
              <h5>Please log in to see the notebook</h5>
              <a href="/login" className="btn btn-primary btn-sm ">
                <i className="fa fa-sign-in" aria-hidden="true"></i> Log in
              </a>
            </p>
          )}

          {loadingState === "error" && isPro && username !== "" && (
            <p style={{ margin: "20px" }}>
              Problem while loading notebook. Please try again later or contact
              Mercury administrator.
            </p>
          )}
          {/* {waiting && (
          <div className="alert alert-primary mb-3" role="alert">
            Notebook is executed. Default notebook is presented below. New
            results will be loaded after execution.{" "}
            <i className="fa fa-coffee" aria-hidden="true"></i> Please wait ...
          </div>
        )} */}
          {errorMsg && (
            <div className="alert alert-danger mb-3" role="alert">
              <b>Notebook is executed with errors.</b>
              <p>{errorMsg}</p>
            </div>
          )}

          {errorMsg === "" && loadingState !== "loading" && (
            <iframe
              width="100%"
              height={iframeHeight}
              key={notebookPath}
              src={`${axios.defaults.baseURL}${notebookPath}${slidesHash}`}
              title="display"
              id="main-iframe"
            ></iframe>
          )}

          {notebookSrc === "" && <p>nothing there</p>}
          {notebookSrc !== "" && (
            <iframe
              srcDoc={notebookSrc}
              width="100%"
              height={iframeHeight}
              key="notebook-src"
              title="display-src"
              id="main-iframe"
            />
          )}
        </div>
      </BlockUi>
    </main>
  );
}
