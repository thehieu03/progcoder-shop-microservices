import Button from "@mui/material/Button";

export default function Home() {
  return (
    <div className="container mt-5">
      <div className="jumbotron text-center">
        <h1 className="display-4">Welcome to Progcoder Shop (Next.js 16)</h1>
        <p className="lead">
          This is the new Storefront built with Next.js App Router, MUI, and
          Bootstrap.
        </p>
        <hr className="my-4" />
        <p>Migration from React SPA is in progress.</p>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="contained" color="primary">
            MUI Button
          </Button>
          <button className="btn btn-success">Bootstrap Button</button>
        </div>
      </div>
    </div>
  );
}
