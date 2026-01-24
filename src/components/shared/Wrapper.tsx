import { FC, ReactNode } from "react";

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div
      className="mx-4 px-4 md:mx-8 md:px-8 xl:mx-16 xl:px-16"
    >
      {children}
    </div>
  );
};

export default Wrapper;

