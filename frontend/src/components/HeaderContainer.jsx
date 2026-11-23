import header from "../pic/header.jpg";

const HeaderContainer = ({ subtitle = "Trainer Portal Sign In" }) => {
  return (
    <>
      <header>
        <img src={header} alt="Balayan Fitness Studio Logo" className="image" />
        <h1>Balayan Fitness Studio</h1>
        <small>{subtitle}</small>
      </header>
    </>
  );
};

export default HeaderContainer;