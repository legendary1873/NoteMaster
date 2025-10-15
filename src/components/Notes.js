import React, { useState } from "react";

const Notes = () => {
  const [subjects, setSubjects] = useState({});
  const [currentSubject, setCurrentSubject] = useState("");
  const [note, setNote] = useState("");

  const handleAddSubject = () => {
    if (currentSubject && !subjects[currentSubject]) {
      setSubjects({ ...subjects, [currentSubject]: [] });
      setCurrentSubject("");
    }
  };

  const handleAddNote = (subject) => {
    if (note) {
      setSubjects({
        ...subjects,
        [subject]: [...subjects[subject], note],
      });
      setNote("");
    }
  };

  const handleDeleteNote = (subject, index) => {
    const updatedNotes = subjects[subject].filter((_, i) => i !== index);
    setSubjects({ ...subjects, [subject]: updatedNotes });
  };

  return (
    <div>
      <h2>Notes</h2>
      <div>
        <input
          type="text"
          placeholder="Add Subject"
          value={currentSubject}
          onChange={(e) => setCurrentSubject(e.target.value)}
        />
        <button onClick={handleAddSubject}>Add Subject</button>
      </div>
      <div>
        {Object.keys(subjects).map((subject) => (
          <div key={subject}>
            <h3>{subject}</h3>
            <ul>
              {subjects[subject].map((note, index) => (
                <li key={index}>
                  {note}
                  <button onClick={() => handleDeleteNote(subject, index)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Add Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={() => handleAddNote(subject)}>Add Note</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;