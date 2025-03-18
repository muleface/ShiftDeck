import React, { useState, useEffect } from 'react';

interface Intern {
    id:number;
    internName:string;
    hospital:string;
}

function InternList() {
    const [interns, setInterns] = useState<Intern[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const fetchInterns = async () => {
            try {
                console.log("Intern List component has been mounted");
                console.log(`${import.meta.env.VITE_API_URL}`);
                setLoading(true); //loading var will be used to inform the user when the fetching process is finished.

                const response = await fetch(`/api/interns/getallinterns`); //performs the http request through the backend server.
                                                                                                           //automatically resolves to a GET request.

                if (!response.ok) {
                    throw new Error(`Error while fetching interns: ${response.status}`);
                }

                const data = await response.json(); //parses the response body into json format

                setInterns(data);
            }
            catch (error) {
                console.error('Could not fetch interns: ', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchInterns(); //actually perform the function call.
    }, []);

    return (
        <>
        {loading ? 
        (<p>Loading Interns from server</p>) :
        (
            <ul>
                {interns.map(intern => (
                                <li key={intern.id}>
                                    <div>
                                        <p>{intern.internName}</p>
                                    </div>
                                </li>
                            ))}
            </ul>
        )}
        </>
    );
}

export default InternList;