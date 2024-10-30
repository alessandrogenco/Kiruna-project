import React, { useEffect, useState } from 'react';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [descriptions, setDescriptions] = useState({});

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

  const handleDescriptionChange = (id, value) => {
    setDescriptions({
      ...descriptions,
      [id]: value,
    });
  };

  const handleAddDescription = async (id, title) => {
    const description = descriptions[id];
    if (!description) return;

    try {
      const response = await fetch('http://localhost:3001/api/addDescription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title, description }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Optionally, update the document list or show a success message
      const updatedDocument = await response.json();
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc.id === id ? { ...doc, description: updatedDocument.document.description } : doc
        )
      );
    } catch (error) {
      console.error('Error adding description:', error);
    }
  };

  return (
    <div>
      <h2>Documents</h2>
      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <div>
              <strong>{document.title}</strong>
              <p>{document.description}</p>
              <input
                type="text"
                placeholder="Add description"
                value={descriptions[document.id] || ''}
                onChange={(e) => handleDescriptionChange(document.id, e.target.value)}
              />
              <button onClick={() => handleAddDescription(document.id, document.title)}>Add Description</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Documents;