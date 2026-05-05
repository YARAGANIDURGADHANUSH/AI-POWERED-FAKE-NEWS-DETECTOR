import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <div className="bg-layer">
        <div className="bg-grid" />
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}