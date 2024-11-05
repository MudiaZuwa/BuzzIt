import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Navbar,
  Container,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import CurrentChat from "../Components/CurrentChat";
import HomeLeftSideBar from "../Components/HomeLeftSideBar";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser";
import ListenDataFromNode from "../Functions/ListenDataFromNode";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import MessageList from "../Components/MessageList";
import MobileBottomNavbar from "../Components/MobileBottomNavbar";
import GroupChatModal from "../Components/GroupChatModal";
import NewChatModal from "../Components/NewChatModal";

const Message = () => {
  const { userId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const { uid, loggedIn } = UseVerifyUser();
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [friendListModalShow, setFriendListModalShow] = useState(false);

  const handleGroupModalOpen = () => setShowGroupModal(true);
  const handleGroupModalClose = () => setShowGroupModal(false);

  const handleFriendListModalOpen = () => setFriendListModalShow(true);
  const handleFriendListModalClose = () => setFriendListModalShow(false);

  const fetchChatDetails = async (isGroupChat, chatId, chatWithUserId) => {
    const path = isGroupChat
      ? `Groups/${chatId}`
      : `UsersDetails/${chatWithUserId}`;
    const details = await FetchDataFromNode(path);

    return details
      ? {
          name: isGroupChat ? details.groupName : details.name,
          profilePhoto: isGroupChat ? details.groupIcon : details.profilePhoto,
          date: details.createdAt || details.date,
          id: details.id,
          ...(isGroupChat && {
            members: details.members,
            createdBy: details.createdBy,
          }),
          isGroupChat,
        }
      : null;
  };

  const fetchFriendsList = async (uid) => {
    const friendsData = await FetchDataFromNode(`friend/${uid}/Friends`);
    if (!friendsData) return [];

    const friendsArray = await Promise.all(
      Object.keys(friendsData).map(async (friendId) => {
        const friendDetails = await FetchDataFromNode(
          `UsersDetails/${friendId}`
        );
        return friendDetails
          ? {
              id: friendId,
              name: friendDetails.name,
              profilePhoto: friendDetails.profilePhoto,
            }
          : null;
      })
    );

    return friendsArray.filter(Boolean);
  };

  useEffect(() => {
    const userChatsPath = `UserChats/${uid}`;
    const unsubscribe = ListenDataFromNode(userChatsPath, async (chatsData) => {
      if (chatsData) {
        const chatsArray = await Promise.all(
          Object.keys(chatsData).map(async (chatId) => {
            const { chatWith, isGroupChat } = chatsData[chatId];
            const chatDetails = { ...chatsData[chatId] };

            const details = await fetchChatDetails(
              isGroupChat,
              chatsData[chatId].id,
              chatWith
            );
            return details
              ? {
                  ...chatDetails,
                  name: details.name,
                  profilePhoto: details.profilePhoto,
                }
              : chatDetails;
          })
        );

        const sortedChats = chatsArray.sort(
          (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
        setPreviousChats(sortedChats);
        if (userId && chatsData[userId]) {
          setCurrentChatId(chatsData[userId].id);
        }
      }
    });

    return () => unsubscribe();
  }, [uid, userId]);

  useEffect(() => {
    const loadFriends = async () => setFriendsList(await fetchFriendsList(uid));
    if (uid) loadFriends();
  }, [uid]);

  useEffect(() => {
    if (!currentChatId) return;

    const chatMessagesPath = `Messages/${currentChatId}`;
    const unsubscribe = ListenDataFromNode(
      chatMessagesPath,
      async (messagesData) => {
        if (!messagesData) return setCurrentMessages([]);

        const chatData = await FetchDataFromNode(
          `UserChats/${uid}/${currentChatId}`
        );
        const isGroupChat = chatData?.isGroupChat || false;

        const enrichedMessages = await Promise.all(
          Object.keys(messagesData).map(async (msgId) => {
            const message = { id: msgId, ...messagesData[msgId] };

            if (isGroupChat) {
              const senderDetails = await FetchDataFromNode(
                `UsersDetails/${message.sender}`
              );
              if (senderDetails) {
                message.senderName = senderDetails.name;
                message.senderProfilePhoto =
                  senderDetails.profilePhoto || "/images/defaultProfile.png";
              }
            }

            return message;
          })
        );

        setCurrentMessages(enrichedMessages);
      }
    );

    return () => unsubscribe();
  }, [currentChatId]);

  useEffect(() => {
    if (!userId || !currentChatId) return;

    const chatDataPath = `UserChats/${uid}/${userId}`;
    const unsubscribe = ListenDataFromNode(chatDataPath, async (chatData) => {
      if (chatData) {
        const details = await fetchChatDetails(
          chatData.isGroupChat,
          currentChatId,
          userId
        );
        setRecipientDetails(details || null);
      }
    });

    return () => unsubscribe();
  }, [userId, currentChatId]);

  return (
    <div>
      {/* Desktop View */}
      <Container fluid>
        <Row>
          <HomeLeftSideBar uid={uid} loggedIn={loggedIn} />

          <Col
            md={10}
            lg={4}
            className={`d-flex flex-column ${userId ? "d-none d-md-flex" : ""}`}
          >
            <Navbar bg="light" className="justify-content-between">
              <Navbar.Brand>Messages</Navbar.Brand>

              {/* Add new group and start new chat icons */}
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  title="Create New Group"
                  onClick={handleGroupModalOpen}
                >
                  <i className="bi bi-people-fill"></i>
                </button>
                <button
                  className="btn btn-outline-secondary"
                  title="Start New Chat"
                  onClick={handleFriendListModalOpen}
                >
                  <i className="bi bi-chat-dots-fill"></i>
                </button>
              </div>
            </Navbar>

            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Search friends or groups"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {previousChats
                .filter((chat) =>
                  chat.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((chat, index) => (
                  <MessageList chat={chat} key={index} />
                ))}
            </div>
          </Col>

          <Col
            lg={6}
            className="d-none d-lg-flex bg-light vh-100 justify-content-center align-items-center"
          >
            {userId ? (
              <CurrentChat
                chatId={currentChatId}
                uid={uid}
                messages={currentMessages}
                recipientDetails={recipientDetails}
              />
            ) : (
              <div className="text-center">
                <h5>Select a new message</h5>
                <Button variant="primary" onClick={handleFriendListModalOpen}>
                  Start a new chat
                </Button>
              </div>
            )}
          </Col>

          {userId && (
            <Col xs={12} className="d-lg-none ">
              <CurrentChat
                chatId={currentChatId}
                uid={uid}
                messages={currentMessages}
                recipientDetails={recipientDetails}
              />
            </Col>
          )}
          <GroupChatModal
            uid={uid}
            show={showGroupModal}
            onClose={handleGroupModalClose}
            friendsList={friendsList}
            groupDetails={userId ? recipientDetails : null}
            userId={userId}
          />

          <NewChatModal
            friendsList={friendsList}
            show={friendListModalShow}
            handleClose={handleFriendListModalClose}
            purpose={"NewChat"}
          />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Message;
