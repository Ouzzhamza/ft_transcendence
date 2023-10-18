"use client";

import { FC, ReactNode, useEffect} from "react";
import LeftSidebar from "@/components/elements/ChatPage/leftsidebar/LeftSidebar";
import { Flex } from "@chakra-ui/react";
import MobileFooter from "@/components/elements/ChatPage/Mobile/MobileFooter";
// import chatSocketsli


export interface LayoutProps{

    children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({children}) => {

    // const socket = 

    return(
        <>
            <Flex className="Chat_Parent h-[calc(100vh_-_170px)] md:h-[calc(100vh_-_90px)] ">
                <LeftSidebar />
                <div className="Chat_sub_div1 flex-grow flex">
                    {children}
                </div>
            </Flex >
            <MobileFooter />
        </>

    )
}

export default Layout;