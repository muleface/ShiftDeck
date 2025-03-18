
function LoggedIn(props:{username:string,logged:boolean}){
    if(props.logged)
    {
        return(
            <div>
                <p>welcome {props.username}, please enter</p>
                <button>Home Page</button>
            </div>
        );
    }
    else{
        return(
            <div>
                <p>who the hell are you? log in!</p>
            </div>
        );
    }
    
}

export default LoggedIn