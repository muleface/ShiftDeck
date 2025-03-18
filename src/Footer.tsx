function Footer() {
    const date = new Date();
    const fullDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;

    return (
        <footer>
            <hr />
            <p>{fullDate}</p>
        </footer>
    );
}

export default Footer;