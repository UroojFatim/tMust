import ContinueShoppingButton from "@/components/ContinueShoppingButton";
import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";

const SuccessPage = () => {
  return (
    <Wrapper>
      <div className="flex flex-col justify-center items-center w-full py-24 mt-20 gap-5 rounded-xl bg-[#f1f1f1]">
        <p className="icon">
          <svg
            color="green"
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 16 16"
            height="80"
            width="80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5v-.5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0zm-.646 5.354a.5.5 0 0 0-.708-.708L7.5 10.793 6.354 9.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"
            ></path>
          </svg>
        </p>
        <h1 className="text-5xl font-bold">Thank you for your order!</h1>
        <p className="font-medium">Check your email inbox for the receipt</p>
        <p className="font-medium mt-2 ">
          If you have any questions, please email 
          <button className="text-red-600 ml-1">
            <a href="mailto:ecommercewebsite@example.com">
              ecommercewebsite@example.com
            </a>
          </button>
        </p>
      <ContinueShoppingButton/>
      </div>
    </Wrapper>
  );
};
export default SuccessPage;
