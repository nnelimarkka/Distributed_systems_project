import React from 'react';
import { useState } from 'react';

const NoteInput = () => {
    const [noteData, setnoteData] = useState({});
    const [errMsg, setErrMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const submit = (e) => {
        e.preventDefault();
        console.log(noteData);

        fetch(`/save`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(noteData),
            mode: "cors"
        
        })
            .then(response => response.json())
            .then(data => {
                if(data.message === 'ok') {
                    setErrMsg("");
                    setSuccessMsg("Note posting was successful.");
                    setTimeout(() => setSuccessMsg(""), 5000);
                    return;
                } else {
                    setErrMsg("Error in posting note.");
                    setSuccessMsg("");
                    setTimeout(() => setErrMsg(""), 5000);
                }
            })
    }

    const handleChange = (e) => {
        setnoteData({...noteData, [e.target.name]: e.target.value});
    }

    return (
        <div>
            <h1>Give your note:</h1>
            <p className="error-container" >{errMsg}</p>
            <p className='success-container'>{successMsg}</p>
            <form onSubmit={submit} onChange={handleChange}>
                <input type="text" name="topic" placeholder="note topic" className='text-container'></input>
                <input type="text" name="header" placeholder="note header" className='text-container'></input>
                <input type="text" name="body" placeholder="note text" className='text-container'></input>
                <input type="text" name="wiki" placeholder="add a wikipedia search for extra info" className='text-container'></input>
                <input className="btn container-button" type="submit" value="submit note"></input>
            </form>
        </div>
    );
};

export default NoteInput;