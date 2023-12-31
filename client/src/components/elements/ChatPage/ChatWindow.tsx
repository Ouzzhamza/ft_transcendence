import { Avatar, Input, useToast } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import arrow from "../../../../assets/icons/arrow.svg";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "@/redux/slices/chat/ChatSlice";
import { ChannelMessage } from "@/utils/types/chat/ChatTypes";
import { useMutation } from "react-query";
import { setLeft, setRight } from "@/redux/slices/chat/MobileSlice";
import { useAppSelector } from "@/redux/store/store";

import { setMessages } from "@/redux/slices/chat/ChatSlice";

export function formatTimeAgo(timestamp: any) {
  const currentTime: any = Date.now();
  const timeDiff = currentTime - timestamp;
  if (timeDiff <= 0) return "Just now";
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (timeDiff < minute) {
    const seconds = Math.floor(timeDiff / 1000);
    return `${seconds} seconds ago`;
  } else if (timeDiff < hour) {
    const minutes = Math.floor(timeDiff / minute);
    return `${minutes} minutes ago`;
  } else if (timeDiff < day) {
    const hours = Math.floor(timeDiff / hour);
    return `${hours} hours ago`;
  } else if (timeDiff < week) {
    const days = Math.floor(timeDiff / day);
    return `${days} days ago`;
  } else if (timeDiff < month) {
    const weeks = Math.floor(timeDiff / week);
    return `${weeks} weeks ago`;
  } else if (timeDiff < year) {
    const months = Math.floor(timeDiff / month);
    return `${months} months ago`;
  } else {
    const years = Math.floor(timeDiff / year);
    return `${years} years ago`;
  }
}

function Message_other({ usermessage, message, sender, time }: any) {
  const [user, setUser]: any = useState();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchmember = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/channel/getmember/` + usermessage.authorID, { credentials: 'include' }
        );
        const member = await fetchmember.json();
        const fetchuser = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/getuser/` + member.userId, { credentials: 'include' }
        );
        const response = await fetchuser.json();
        let blockedusers = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/blockedusers`, { credentials: 'include' }
        );
        let blockedusersjson = await blockedusers.json();
        blockedusersjson = blockedusersjson.map((user: any) => {
          return user.username;
        });
        if (blockedusersjson.includes(response.username)) {
          setUser(null)
          return
        }
        blockedusers = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/getblockedbyusers`, { credentials: 'include' }
        );
        blockedusersjson = await blockedusers.json();
        blockedusersjson = blockedusersjson.map((user: any) => {
          return user.username;
        });
        if (blockedusersjson.includes(response.username)) {
          setUser(null)
          return
        }
        setUser(response);
      } catch (error) {
        const fetchuser = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/getuser/` + usermessage.authorID, { credentials: 'include' }
        );
        const response = await fetchuser.json();
        let blockedusers = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/blockedusers`, { credentials: 'include' }
        );
        let blockedusersjson = await blockedusers.json();
        blockedusersjson = blockedusersjson.map((user: any) => {
          return user.username;
        });
        if (blockedusersjson.includes(response.username)) {
          setUser(null)
          return
        }
        blockedusers = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/getblockedbyusers`, { credentials: 'include' }
        );
        blockedusersjson = await blockedusers.json();
        blockedusersjson = blockedusersjson.map((user: any) => {
          return user.username;
        });
        if (blockedusersjson.includes(response.username)) {
          setUser(null)
          return
        }
        setUser(response);
      }
    };
    fetchData();
  }, [usermessage]);

  const timestamp = Date.parse(time);
  const formattedTime = formatTimeAgo(timestamp);

  return (
    user != null ? <div className="w-full flex gap-[5px] pl-[15px] z-0 ">
      <Avatar className="custom-shadow2" boxSize={12} src={user?.avatarURL} />
      <div className="flex flex-col min-w-[50%] max-w-[60%]">
        <div className="w-[50%] text-grey-400 flex justify-start relative">
          {sender} | {formattedTime}
        </div>
        <div className="bg-white border-2 border-black rounded-2xl custom-shadow2  rounded-tl-none pl-[10px] min-h-[60px]">
          <div className="flex w-full h-full items-center break-all">{message}</div>
        </div>
      </div>
    </div> : <div></div>)

}

function Own_Message({ message, user }: any) {
  const timestamp = Date.parse(message.createdAt);
  const formattedTime = formatTimeAgo(timestamp);

  return (
    <div className=" w-full flex gap-[5px] justify-end pr-[15px] z-0">
      <div className="flex flex-col min-w-[50%] max-w-[60%]">
        <div className="w-full text-grey-400 flex justify-end relative">
          {user?.username} | {formattedTime}
        </div>
        <div className="bg-black border-2 border-black rounded-2xl custom-shadow text-white rounded-tr-none justify-start pl-[10px] w-full min-h-[60px] ">
          <div className="w-full h-full flex items-center  break-all">
            {message?.content}
          </div>
        </div>
      </div>
      <Avatar className="custom-shadow" boxSize={12} src={user?.avatarURL} />
    </div>
  );
}

export default function ChatWindow() {
  const { handleSubmit, register, reset } = useForm<any>();
  const chatContainer = useRef<any>(null);

  const selected = useSelector(
    (state: any) => state.chat.selectedChannelorUser
  );
  const messages: ChannelMessage[] = useSelector(
    (state: any) => state.chat.messages
  );
  const userId = useSelector((state: any) => state.socket.userID);
  const dispatch = useDispatch();

  const [user, setUser]: any = useState();
  const toast = useToast();
  const socket = useAppSelector((state) => state.socket.socket);

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const HideMobileSideBars = () => {
    if (window?.innerWidth < 1024) {
      dispatch(setRight(false));
      dispatch(setLeft(false));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const url = process.env.NEXT_PUBLIC_SERVER_URL;
        const fetchuser = await fetch(
          `${url}/users/getuser/${userId}`, { credentials: 'include' }
        );
        const response = await fetchuser.json();
        setUser(response);
      }
    };
    fetchData();

  }, [userId]);

  const handleNewMessage = async (data: any) => {
    if (data.newmessage.trim() === "") return;
    if (selected == null) {
      reset({ newmessage: "" });
      return;
    }
    if (data.newmessage.length > 500) {
      toast({
        title: "Message too long",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      reset({ newmessage: "" });
      return;
    }

    if ("name" in selected) {
      socket?.emit("sendMessage", {
        channelId: selected.id,
        userId: userId,
        message: data.newmessage,
      });
    } else {

      socket?.emit(`sendPrivateMessage`, {
        reciverId: selected.id,
        message: data.newmessage,
      });
    }
    reset({ newmessage: "" });
    scrollToBottom();
  };

  const getChannelMessages: any = useMutation<any, Error, any>((variables) =>
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/message/getmessages/` + variables.channelId, { credentials: 'include' })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        return error;
      })
  );

  const getUserMessages: any = useMutation<any, Error, any>((variables) =>
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/message/getMessagesUsers/` +
      variables.userId +
      "/" +
      variables.reciverId, { credentials: 'include' }
    )
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        return error;
      })
  );

  useEffect(() => {
    const fetchChannelMessages = async () => {
      let messages: ChannelMessage[] = await getChannelMessages.mutateAsync({
        channelId: selected?.id,
      });
      if (messages.length != 0) {
        dispatch(setMessages(messages));
      } else dispatch(setMessages([]));
    };

    const fetchUserMessages = async () => {
      let messages: ChannelMessage[] = await getUserMessages.mutateAsync({
        userId: userId,
        reciverId: selected?.id,
      });
      if (messages.length != 0) {
        dispatch(setMessages(messages));
      } else dispatch(setMessages([]));
    };

    if (selected && "name" in selected && selected.id != null)
      fetchChannelMessages();

    if (selected && "username" in selected && selected.id != null)
      fetchUserMessages();

    socket?.on("receivedMessage", (data: any) => {
      if (selected?.id === data.channelId) {
        dispatch(addMessage(data.message));
      }
    });
    socket?.on("receivedPrivateMessage", (data: any) => {
      if (
        selected?.id === data.message.reciverName ||
        selected?.id === data.message.authorID
      )
        dispatch(addMessage(data.message));
    });

    socket?.on("sendMessage", (data: any) => {
      toast({
        title: data.status,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    });

    return () => {
      socket?.off("receivedMessage");
      socket?.off("receivedPrivateMessage");
      socket?.off("sendMessage");
    };
  }, [selected]);

  return (
    <div className="justify-between w-[80%] h-[95%] flex-col gap-[15px] pt-[120px] flex-1">
      <div
        className=" flex flex-col gap-[10px] overflow-y-scroll no-scrollbar z-0 h-[94%] pb-12 "
        ref={chatContainer}
      >
        {messages &&
          messages.length != 0 &&
          messages.map((message: ChannelMessage, index: number) => {
            if (message?.authorName === user?.username) {
              return <Own_Message key={index} message={message} user={user} />;
            }
            return (
              <Message_other
                key={index}
                usermessage={message}
                message={message.content}
                sender={message.authorName}
                time={message.createdAt}
              />
            );
          })}
      </div>
      <form
        onSubmit={handleSubmit(handleNewMessage)}
        className="h-[55px] mb-[15px] flex justify-around items-center "
      >
        <Input
          {...register("newmessage")}
          className="bg-[#D9D9D9] border-2 rounded-ld w-[90%] border-black h-[100%]"
          placeholder="Type your message here ..."
          onClick={() => {
            HideMobileSideBars();
          }}
        />
        <button
          type="submit"
          className="bg-black w-[50px] rounded-md cursor-pointer flex justify-start items-center h-[100%]"
        >
          <Image className=" w-[40px] " src={arrow} alt="arrow" />
        </button>
      </form>
    </div>
  );
}
