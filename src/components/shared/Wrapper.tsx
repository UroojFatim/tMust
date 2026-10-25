import { FC, ReactNode } from "react";

const Wrapper: FC<{ children: ReactNode; noGutters?: boolean }> = ({ children, noGutters }) => {
  const classes = noGutters
    ? "mx-0 px-6 w-full"
    : "px-4 md:px-8 max-w-screen-2xl mx-auto";

  return <div className={classes}>{children}</div>;
};

export default Wrapper;

