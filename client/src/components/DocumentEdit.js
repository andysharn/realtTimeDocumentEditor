import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DocumentEdit() {
  const [document, setDocument] = useState({ title: '', content: '', owner: '' });
  const [collaborators, setCollaborators] = useState([]);
  const { id } = useParams();
  const [socket, setSocket] = useState(null);

  const copyDocumentId = () => {
    navigator.clipboard.writeText(id).then(() => {
      toast("Document ID copied!");
    }).catch(err => {
      toast.error("Failed to copy Document ID");
    });
  };


  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });
    setSocket(newSocket);

    newSocket.emit('join-document', id);

    newSocket.on('document-update', (updatedDoc) => {
      setDocument(updatedDoc);
    });

    newSocket.on('collaborators-update', (updatedCollaborators) => {
      setCollaborators(updatedCollaborators);
    });

    return () => {
      newSocket.emit('leave-document', id);
      newSocket.disconnect();
    };
  }, [id]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setDocument(prev => ({ ...prev, content: newContent }));
    socket.emit('update-document', { documentId: id, content: newContent });
  };

  return (
    <div>
      <h2>{document.title}</h2>
      <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={copyDocumentId}>
          Copy Document ID
        </button>
        <ToastContainer />
      </div>

        <strong>Collaborators: </strong>
        {collaborators.map((collaborator, index) => (
          <span key={index} style={{ marginRight: '10px' }}>
            <span style={{ 
              color: collaborator.isOnline ? 'green' : 'gray', 
              marginRight: '5px' 
            }}>●</span>
            <span style={{ 
              fontWeight: collaborator.username === document.owner ? 'bold' : 'normal' 
            }}>
              {collaborator.username}
            </span>
          </span>
        ))}
      </div>
      <textarea
        value={document.content}
        onChange={handleContentChange}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}; 


export default DocumentEdit;