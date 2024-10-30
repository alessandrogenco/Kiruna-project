import React, { useEffect, useState } from 'react';

function Documents() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/documents');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      <h2>Documents</h2>
      <ul>
        {documents.map((document) => (
          <li key={document.id}>{document.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Documents;