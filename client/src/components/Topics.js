import React, { useState } from 'react';
import { useEffect } from 'react';

const Topics = () => {
    const [notes, setNotes] = useState([]);
    const [errMsg, setErrMsg] = useState("");

    const fetchNotes = () => {
        fetch("/notes", {
          method: "GET"
        })
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              setNotes([]);
              setErrMsg("No notes found");
            } else {       
                setNotes(data);
                console.log(data);
                setErrMsg("");
            }
          })
      }
    
    useEffect(() => {
        fetchNotes();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <div>
            <h3>Current notes:</h3>
            {notes?.length === 0 && <p>No notes found :(</p>}

            
            {notes?.length > 0 &&
                notes.map((topic, i) => {
                    return(
                        <div key={i}>
                            <h4 className='post-header'>Topic: {topic.$.name}</h4>
                            {
                            topic.note.map((note, i) => {
                                return(
                                    <div key={i} className="content-container">
                                        <p className="post-time">
                                            Posted: {note.timestamp}
                                        </p>
                                        <p className='post-header'>
                                            {note.$.name}
                                        </p>
                                       <p>
                                            {note.text}
                                        </p>
                                        {note?.wikiInfo?.length > 0 &&
                                        <h4>More info:</h4>
                                        }
                                        {note?.wikiInfo?.length > 0 &&
                                        <a href={note.wikiInfo}>{note.wikiInfo}</a>
                                        }
                                    </div>
                                )
                            })
                            } 
                        </div>
                    )
                })
            }
        </div>
    );
};

export default Topics;