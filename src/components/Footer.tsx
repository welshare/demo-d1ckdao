export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-left">© DICKGPT</div>
      <div className="footer-right">
        <a
          href="https://welshare.health"
          target="_blank"
          rel="noopener noreferrer"
        >
          supported by Welshare
        </a>
        {" · "}
        <a
          href="https://docs.welshare.app/sdk"
          target="_blank"
          rel="noopener noreferrer"
        >
          docs
        </a>
        {" · "}
        <a
          href="https://staging.wallet.welshare.app/api/questionnaire/f1ce9502-6b5c-4705-849b-972bbc61c558"
          target="_blank"
          rel="noopener noreferrer"
        >
          Questionnaire definition
        </a>
      </div>
    </footer>
  );
};
