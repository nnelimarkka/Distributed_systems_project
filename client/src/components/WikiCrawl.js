import React from 'react';
import { useState } from 'react';

const WikiCrawl = () => {
    const [wikiTitles, setWikiTitles] = useState({});
    const [errMsg, setErrMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [routeMessage, setRouteMessage] = useState("No input");

    const handleChange = (e) => {
        setWikiTitles({...wikiTitles, [e.target.name]: e.target.value});
    }

    const submit = (e) => {
        e.preventDefault();
        console.log(wikiTitles);
        if (wikiTitles === null) {
            setErrMsg("Articles were not found!");
            setSuccessMsg("");
            setTimeout(() => setErrMsg(""), 5000);
            return;
        }

        fetch(`/islegit`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(wikiTitles),
            mode: "cors"
        
        })
            .then(response => response.json())
            .then(data => {
                if(data.message) {
                    setErrMsg("");
                    setSuccessMsg("Articles were found");
                    setRouteMessage("searching for route between "+data.wikifrom+" and "+data.wikito+"...");
                    setTimeout(() => setSuccessMsg(""), 5000);
                    searchRoute(data.wikifrom, data.wikito);
                    return;
                } else {
                    setErrMsg("Articles were not found!");
                    setSuccessMsg("");
                    setTimeout(() => setErrMsg(""), 5000);
                }
            })
    }

    const searchRoute = (wikifrom, wikito) => {
        fetch(`/api/search`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                wikifrom: wikifrom,
                wikito: wikito
            }),
            mode: "cors"
        
        })
            .then(response => response.json())
            .then(data => {
                if(data.message) {
                    setErrMsg("");
                    setRouteMessage(data.message);
                    return;
                } else {
                    setErrMsg("Articles were not found!");
                    setSuccessMsg("");
                    setTimeout(() => setErrMsg(""), 5000);
                }
            })
    }

    return (
        <div>
           <h2>Give two Wikipedia-titles:</h2>
            <p className="error-container" >{errMsg}</p>
            <p className='success-container'>{successMsg}</p>
            <form onSubmit={submit} onChange={handleChange}>
                <input type="text" name="wikifrom" placeholder="Title no. 1" className='text-container'></input>
                <input type="text" name="wikito" placeholder="Title no. 2" className='text-container'></input>
                <input className="btn container-button" type="submit" value="Search route"></input>
            </form>
            <div>
                <h3>Route:</h3>
                <p>{routeMessage}</p>
            </div>
        </div>
    );
};

export default WikiCrawl;