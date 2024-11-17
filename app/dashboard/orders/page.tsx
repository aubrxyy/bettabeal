import Header from "../Header";
import Navbar from "../Navbar";



export default function Page() {
    return (
    <div className="flex">
      <Header />
      <Navbar />
      <div className="flex-1" style={{ background: 'linear-gradient(to right, #1DACFE 45%, #7ec9f2 94%)' }}>
        <div className="px-5 py-4 mt-[4.63rem]">
          Orders
        </div>
      </div>
    </div>
    );
    }