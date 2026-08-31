"use client";

import { TailSpin } from "react-loader-spinner";

export default function Loader() {
  return (
    <div className="flex justify-center items-center">
      <TailSpin height={40} width={40} color="#f2c7c7" ariaLabel="loading" />
    </div>
  );
}
