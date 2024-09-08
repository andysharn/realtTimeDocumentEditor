import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { AuthContext } from '../contexts/AuthContext';

const Editor = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { id } = useParams();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDocument();
    socket.emit('joinDocument', { documentId: id, userId: user.username });

    socket.on('documentUpdate', ({ content: newContent }) => {
      setContent(newContent);
    });

    socket.on('userJoined', ({ userId, connectedUsers: users }) => {
      setConnectedUsers(users);
      alert(`${userId} joined the document`);
    });

    socket.on('userLeft', ({ userId }) => {
      setConnectedUsers(prev => prev.filter(u => u !== userId));
      alert(`${userId} left the document`);
    });

    return () => {
      socket.emit('leaveDocument', { documentId: id });
      socket.off('documentUpdate');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [id, user.username]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setContent(response.data.content);
      setTitle(response.data.title);
    } catch (error) {
      console.error('Error fetching document:', error);
      history.push('/documents');
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    socket.emit('documentChange', { documentId: id, content: newContent });
  };

  return (
    <div>
      <h2>{title}</h2>
      <div>
        Connected Users: {connectedUsers.join(', ')}
      </div>
      <textarea
        value={content}
        onChange={handleContentChange}
        style={{ width: '100%', height: '400px' }}
      />
      <button onClick={() => history.push('/documents')}>Back to Documents</button>
    </div>
  );
};

export default Editor;