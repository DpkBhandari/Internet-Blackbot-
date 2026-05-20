import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <p className="font-display text-7xl font-semibold">404</p>
        <p className="text-muted mt-3">This page doesn't exist.</p>
        <Link to="/" className="inline-block mt-6"><Button>Back home</Button></Link>
      </div>
    </div>
  );
}
