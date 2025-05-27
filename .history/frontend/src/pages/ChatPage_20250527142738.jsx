import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getUserById } from "../lib/api";
import { ArrowLeftIcon, InfoIcon, VideoIcon } from "lucide-react";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: targetUser } = useQuery({
    queryKey: ["user", targetUserId],
    queryFn: () => getUserById(targetUserId),
    enabled: !!targetUserId,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initialisation du client de chat Stream...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du chat:", error);
        toast.error("Impossible de se connecter au chat. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `J'ai démarré un appel vidéo. Rejoignez-moi ici : ${callUrl}`,
      });

      toast.success("Lien d'appel vidéo envoyé avec succès !");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col">
      {/* Mobile header with user info */}
      <div className="lg:hidden border-b bg-base-200">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
              <ArrowLeftIcon className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="avatar size-8">
                <img src={targetUser?.profilePic} alt={targetUser?.fullName} className="object-cover" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">{targetUser?.fullName}</h2>
                <p className="text-xs opacity-70">{targetUser?.location}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="btn btn-ghost btn-sm"
            >
              <InfoIcon className="size-4" />
            </button>
            <button 
              onClick={handleVideoCall}
              className="btn btn-success btn-sm text-white"
            >
              <VideoIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* User info panel */}
        {showUserInfo && targetUser && (
          <div className="p-3 bg-base-100 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Langue maternelle:</span>
                <span className="text-xs">{targetUser.nativeLanguage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Apprentissage:</span>
                <span className="text-xs">{targetUser.learningLanguage}</span>
              </div>
              {targetUser.bio && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium">Bio:</span>
                  <span className="text-xs">{targetUser.bio}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <div className="w-full relative h-full">
              {/* Desktop video call button */}
              <div className="hidden lg:block">
                <CallButton handleVideoCall={handleVideoCall} />
              </div>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
            </div>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;
