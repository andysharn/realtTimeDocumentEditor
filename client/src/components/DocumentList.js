import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [joinDocumentId, setJoinDocumentId] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/documents", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    if(newDocumentTitle){
      try {
        await axios.post(
          "http://localhost:5000/documents",
          { title: newDocumentTitle, content: "" },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setNewDocumentTitle("");
        fetchDocuments();
      } catch (error) {
        console.error("Error creating document:", error);
      }
    }else{
      toast.error("Document title can't be empty");
    }
  
  };

  const joinDocument = async (e) => {
    e.preventDefault();
    if(joinDocumentId){
      try {
        await axios.post(
          `http://localhost:5000/documents/${joinDocumentId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setJoinDocumentId("");
        fetchDocuments();
        toast("Document added successfully !");
      } catch (error) {
        console.error("Error joining document:", error);
      }
    }else{
      toast.error("Document Id can't be empty");
    }
  };

  return (
    <div>
      <ToastContainer/>
    <div
      style={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        width: "400px",
        textAlign: "center",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      
      <h2>Your Documents</h2>
      
      <ol>
        {
        documents.length>0?
        (
          documents.map((doc) => (
            <li key={doc._id}>
              <Link to={`/document/${doc._id}`}>{doc.title}</Link>
            </li>
          ))
        ):
        <p>No document is present</p>
      }
        
      </ol>

      <h2
      style={{
        marginTop:'50px'
      }}
      >--------- Document Action --------- </h2>


      <form onSubmit={createDocument}>
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="New Document Title"
          style={{
            marginBottom: "10px",
            padding: "8px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px",
            width: "100%",
            backgroundColor: "#1877f2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Create Document
        </button>
      </form>
      <form onSubmit={joinDocument}>
        <input
          type="text"
          value={joinDocumentId}
          onChange={(e) => setJoinDocumentId(e.target.value)}
          placeholder="Document ID to Join"
          style={{
            marginBottom: "10px",
            padding: "8px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px",
            width: "100%",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Join Document
        </button>
      </form>
    </div>
    </div>
  );
}

export default DocumentList;
