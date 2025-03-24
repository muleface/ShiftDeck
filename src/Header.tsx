import styles from './Header.module.css'
function Header(){
    return(
        <header className={styles.header}>
            <h1> Shift Deck </h1>
            
            <hr></hr>
            {/*
      {isLogged ? (
        <>
        
          <Header />

          <p>hello {user}</p>
          
          <Footer />
        </>
      ) : (
        <UserContext.Provider value={{user, setUser, isLogged, setIsLogged}}>
          <LogIn />
        </UserContext.Provider>
      )}
        */}
        </header>
        
    );
}
export default Header