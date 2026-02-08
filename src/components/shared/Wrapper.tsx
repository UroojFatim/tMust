import { FC, ReactNode } from "react";

const Wrapper: FC<{ children: ReactNode; noGutters?: boolean }> = ({ children, noGutters }) => {
  const classes = noGutters
    ? "mx-0 px-6 w-full"
    : "mx-4 px-4 md:mx-8 md:px-8";

  return <div className={classes}>{children}</div>;
};

export default Wrapper;

