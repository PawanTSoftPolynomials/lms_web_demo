"use client";

import { TailSpin, RotatingLines } from "react-loader-spinner";

export default function Loader() {
  return (
    <div className="flex justify-center items-center">
      <TailSpin height={40} width={40} color="#f97316" ariaLabel="loading" />
    </div>
  );
}
