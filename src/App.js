import React, { useState, useEffect, useRef } from "react";
import { Input, Upload, Button, message } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import "./DocWithAI.scss";
import axios from "axios";
// import { fetchAssets } from "../../../../store/assets/assetsExtraReducers";
import { ReactComponent as FileIcon } from "./fileicon.svg";
import { ReactComponent as ScanIcon } from "./scanIcon.svg";
// import { ReactComponent as SendEnable } from "../../Groups/GroupDetails/GroupDetailContainer/images/sendEnable.svg";
// import axiosInstance from "../../../../utils/axios/axiosInstance";
// import MessageComponent from "../../../MessageComponent";
// import PageLoader from "../../../PageLoader";
import pdfToText from "react-pdftotext";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentAI = () => {
  const [file, setFiles] = useState([]);
  const [key, setKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pdfText, setPdfText] = useState([]);
  const [topic, setTopic] = useState("");
  const [chatData, setChatData] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showtextArea, setShowTextArea] = useState(false);
  const [selectedtext, setSelectedText] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [res, setRes] = useState("");
  const chatContainerRefUsers = useRef(null);
  const handleFileListChange = (event) => {
    const file = event.target.files[0];
    pdfToText(file)
      .then((text) => {
        setPdfText(text);
        console.log(text);
      })
      .catch((error) => console.error("Failed to extract text from pdf"));
  };

  const loadPdfDocument = async (newFileList) => {
    try {
      console.log(newFileList);
      const pdfDocument = await pdfjs.getDocument({ data: newFileList })
        .promise;
      // console.log(pdfDocument);
      setPdfDocument(pdfDocument);
      setNumPages(pdfDocument.numPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };
  const fetchAllFiles = async () => {
    try {
      // MessageComponent({ type: "loading", content: "Please Wait..." });
      // const res = await axiosInstance.get("/assets/get-files-with-url");
      // const filterPDF = res.data.filter(file =>
      //   file.asset_url?.endsWith(".pdf"),
      // );
      // setFiles(filterPDF);
      // setSearchedData(filterPDF);
      // setKey(filterPDF[0]?.asset_url);
      // message.destroy();
    } catch (error) {
      console.error(error);
    }
  };
  const extractTextFromPage = async (pdfPage) => {
    const textContent = await pdfPage.getTextContent();
    const textItems = textContent.items;
    const pageText = textItems.map((item) => item.str).join(" ");
    return pageText;
  };
  const handleUserQuery = async (e) => {
    setTopic(e.target.value);
  };
  const handleSend = async () => {
    if (pdfText.length == 0) {
      // MessageComponent({
      //   content: "Upload your pdf first.",
      //   type: "info",
      // });
      console.log("upload pdf");
    } else {
      if (topic?.length < 1) {
        // MessageComponent({
        //   content: "Enter something to search",
        //   type: "fix",
        // });
        console.log("enter somethng to serach");
      } else {
        let limitedPdfText = "";
        if (showtextArea == true && selectedtext.length > 0) {
          limitedPdfText = selectedtext;
        } else {
          // Limit the PDF text to 2000 words
          limitedPdfText = pdfText.slice(0, 2000);
        }
        try {
          setTopic("");
          setLoading(true);
          const response = await fetch(
            "https://backend-testing.kognics.com/lemmetiz-stemming-text",
            {
              method: "POST",
              body: JSON.stringify({ pdfText: pdfText, Question: topic }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const reader = response.body.getReader();
          let data = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            data += new TextDecoder().decode(value);
            setRes((prevRes) => prevRes + new TextDecoder().decode(value));
          }
          const chatObject = {
            id: nextId,
            topic: topic,
            response: data,
          };
          console.log(chatObject);
          if (showtextArea == true && selectedtext.length > 0) {
            setShowTextArea(false);
          }
          setChatData((prevChatData) => [...prevChatData, chatObject]);
          setNextId(nextId + 1);
          setRes("");
          setLoading(false);
        } catch (error) {
          console.log("error::::", error);
        }
      }
    }
  };
  const handlChangeSearch = async (e) => {
    if (e.target.length === 0) {
      setSearchedData(file);
    } else {
      const filterData = file.filter((pdf) =>
        pdf.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSearchedData(filterData);
    }
  };
  const handleSelectiveText = (e) => {
    setSelectedText(e.target.value);
  };
  const bytesToMB = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(4); // Rounds the result to 4 decimal places
  };
  useEffect(() => {
    fetchAllFiles();
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat container after messages are loaded
    if (chatContainerRefUsers.current) {
      chatContainerRefUsers.current.scrollTop =
        chatContainerRefUsers.current.scrollHeight;
    }
  }, [chatData, loading]);
  // function cutTextIntoChunks(text, chunkSize) {
  //   const encoder = new TextEncoder();
  //   const bytes = encoder.encode(text);
  //   const textSizeInBytes = bytes.length;
  //   if (textSizeInBytes <= chunkSize) {
  //     // If the text is smaller than or equal to the desired chunk size, return it as is
  //     return [text];
  //   }
  //   const chunks = [];
  //   let currentPosition = 0;
  //   while (currentPosition < textSizeInBytes) {
  //     const chunk = text.slice(currentPosition, currentPosition + chunkSize);
  //     chunks.push(chunk);
  //     currentPosition += chunkSize;
  //   }
  //   return chunks;
  // }
  return (
    <div className="doc-ai-main-container">
      <div className="doc-upload-left-container">
        <p className="header-DA">
          {/* <BackIcon /> */}
          Doc.AI
        </p>
        <input
          placeholder="Search file here"
          className="input-search"
          // onChange={handlChangeSearch}
        />
        <div className="upload-file-container">
          <p>Upload your PDF to chat</p>
          <input
            type="file"
            accept=".pdf"
            className="file-upload-input"
            onChange={handleFileListChange}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflow: "auto",
          }}
        >
          {file?.length > 0 &&
            searchedData.map((pdf) => (
              <div
                style={{ cursor: "pointer" }}
                className={`file-show-div ${
                  key == pdf.asset_url && `selected`
                }`}
                onClick={() => setKey(pdf.asset_url)}
              >
                <p className="file-details">
                  <FileIcon />
                  <p>
                    <p className="name">
                      {pdf?.name.length > 30
                        ? pdf?.name.slice(0, 30) + ". . ."
                        : pdf?.name}
                    </p>
                    <p className="size">{bytesToMB(file?.size)}MB</p>
                  </p>
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="pdf-viewer">
        {key.length > 0 ? (
          <iframe
            // src={`${CLOUDFRONT_URL + key}#toolbar=1`}
            title="pdf-viewer"
            width="100%"
            height="100%"
            allowFullScreen={false}
            loading="lazy"
          />
        ) : (
          <p
            style={{
              color: "#2a7680",
              fontStyle: "italic",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {uploading == false ? (
              <>
                <FileIcon />
                Upload Pdf to chat with it
              </>
            ) : (
              // <PageLoader />
              ""
            )}
          </p>
        )}
      </div>
      <div className="ai-interaction-container-right">
        <div className="head-chat-da">Chat</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            height: "93%",
          }}
        >
          <div className="chat-doc-div" ref={chatContainerRefUsers}>
            {chatData.map((chat, index) => (
              <>
                <div className="prompt-response-chat">
                  <div>
                    <p className="prompt">
                      {" "}
                      <img className="user-pic"></img>
                      {chat.topic}
                    </p>
                    <p className="response">{chat.response}</p>
                    {index < chatData.length - 1 && <p className="border"></p>}
                  </div>
                </div>
              </>
            ))}
            {loading && (
              <div className="prompt-response-chat">
                <div>
                  <p className="prompt">
                    <img className="user-pic"></img>
                    <p>{"currentTopicText"}</p>
                  </p>
                  <p className="response">
                    {loading == true && res.length > 0
                      ? res
                      : " <PageLoader />"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            {showtextArea && (
              <div className="textArea">
                <Input.TextArea
                  value={selectedtext}
                  onChange={handleSelectiveText}
                  placeholder="Copy and paste your text here!"
                  autoSize={{ minRows: 5, maxRows: 5 }}
                ></Input.TextArea>
              </div>
            )}
            <div className="send-chat-footer">
              <div className="chat">
                <p className="selected-text"></p>
                <div className="input-send-div">
                  <ScanIcon
                    onClick={() => {
                      setSelectedText("");
                      setShowTextArea(!showtextArea);
                    }}
                    className="show-textarea"
                  />
                  <input
                    value={topic}
                    className="input-send-msg"
                    placeholder="Type Your Question or paste.."
                    onChange={handleUserQuery}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent the default behavior (form submission)
                        handleSend();
                      }
                    }}
                  />
                  <button className="send-btn-DC" onClick={() => handleSend()}>
                    send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAI;
