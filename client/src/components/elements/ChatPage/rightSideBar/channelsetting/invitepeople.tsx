import React, { useEffect,  useState } from 'react'
import { Box, Button, ModalFooter, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import ModalWraper from '../../ModalWraper'
import Image from 'next/image'
import invite from "../../../../../../assets/icons/invite.svg"
import { User } from '@/utils/types/chat/ChatTypes'
import Usercard from './UserCard'



function Componenent({ onClose }: any) {

    const [users, setUsers] = useState<any[]>([])

    const [selectedOption, setSelectedOption]: any = useState('');
    const channel = useSelector((state: any) => state.chat.selectedChannelorUser)
    const userId = useSelector((state: any) => state.socket.userID)
    const toast = useToast()
    const socket = useSelector((state: any) => state.socket.socket)

    const handleOptionChange = (newValue: any) => {

        setSelectedOption(newValue);

    };

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const [usersResponse, membersResponse] = await Promise.all([
              fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/getAllUsers/` + userId, {credentials: 'include'}).then((api) => api.json()),
              fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/channel/getallmembers/` + channel.id, {credentials: 'include'}).then((api) => api.json())
            ]);
      
            const memberUserIds = membersResponse.map((member: any) => member.userId);
      
            const filteredUsers = usersResponse.filter((user: any) => {
              return user.id !== userId && !memberUserIds.includes(user.id);
            });
      
            setUsers(filteredUsers);
          } catch (error) {

            toast({
                title: 'Error fetching users and channel members',
                position: `bottom-right`,
                status: 'error',
                duration: 1000,
                containerStyle: {
                    bottom: 90,
                    right: 30,
                },
                });
          }
        };
      
        fetchUsers();
      }, []);



    async function   onInvite() {

        socket?.emit('inviteMember', {
            channelId: channel.id,
            memberId: selectedOption.id,
        })
        onClose()
    }

    return (
        <div>

            <div className=' mt-[40px] flex  h-[500px] flex-col w-full  gap-6 overflow-y-scroll no-scrollbar '>

                {users.map((data: User) => {
                    return <Usercard 
                        key={data.username}
                        data={data}
                        selectedOption={selectedOption}
                        onOptionChange={handleOptionChange}
                    />
                })}

            </div>
            <ModalFooter>
                <Button
                    colorScheme="red"
                    variant="outline"
                    mr={10}
                    onClick={onClose}
                >
                    Close
                </Button>
                <Button
                    colorScheme="green"
                    variant="outline"
                    ml={10}
                    onClick={() => {
                        onInvite()
                    }}
                >
                    Confirm
                </Button>
            </ModalFooter></div>)
}


export default function InvitePeople() {


    const { isOpen, onOpen, onClose } = useDisclosure()
    const [imageAlt, setImageAlt] = useState('');



    const data = { src: invite, alt: "Invite People" }


    return (<Box className='flex items-center gap-6 w-[220px]'
        key={data.alt}
    >
        <Image src={data.src} width={30} height={30} alt={data.alt} />
        <Text className='text-2xl cursor-pointer'
            onClick={() => { onOpen(); setImageAlt(data.alt) }}
        >
            {data.alt}
        </Text>
        <ModalWraper isOpen={isOpen} onClose={onClose} imageAlt={imageAlt} Componenent={() => <Componenent onClose={onClose}/>} />

    </Box>)
}
