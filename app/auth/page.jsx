import Login from "../components/AuthForm/Login";
import SignUp from "../components/AuthForm/SignUp";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";

export default function page() {


    return (
        <div className="bg-slate-800 h-screen w-full">
            <div className="grid p-6 grid-cols-2">
                <div>
                    <TabRoot defaultValue="login">
                        <TabList className="p-4">
                            <TabTrigger className="px-4" value="login">Sign Up</TabTrigger>
                            <TabTrigger className="px-4" value="signin" >Sign In </TabTrigger>
                        </TabList>

                        <TabContent value="login" >
                            <Login />
                        </TabContent>

                        <TabContent value="signin" >
                            <SignUp />
                        </TabContent>
                    </TabRoot>
                </div>

                <div>
                    authentication page
                </div>
            </div>





        </div>)
}