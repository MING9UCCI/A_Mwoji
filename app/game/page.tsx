import { Suspense } from "react";
import GameClient from "./GameClient";
import { Loader2 } from "lucide-react";

export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex flex-col items-center justify-center text-primary gap-4"><Loader2 className="animate-spin" size={32} /></div>}>
      <GameClient />
    </Suspense>
  );
}
