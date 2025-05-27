import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { ArrowLeftIcon } from "lucide-react";

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

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
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
    <div className="h-screen flex flex-col">
      {/* Mobile back button */}
      <div className="lg:hidden p-4 border-b">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          <ArrowLeftIcon className="size-4 mr-2" />
          Retour
        </button>
      </div>

      <div className="flex-1 relative">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <div className="w-full h-full relative">
              {/* CallButton avec position responsive */}
              <CallButton 
                handleVideoCall={handleVideoCall} 
                className="absolute top-2 right-2 lg:top-4 lg:right-4 z-10"
              />
              
              <Window>
                {/* Header masqué sur mobile */}
                <ChannelHeader className="hidden lg:block" />
                
                {/* Liste de messages avec espacement adaptatif */}
                <MessageList 
                  className="px-2 lg:px-4 !pb-0" 
                  messageRenderer={({ message }) => (
                    <div className="break-words max-w-[90%] lg:max-w-[80%]">
                      {/* Composant de message par défaut */}
                      <DefaultMessageRenderer message={message} />
                    </div>
                  )}
                />
                
                {/* Input avec espacement mobile */}
                <MessageInput
                  focus
                  className="!p-2 lg:!p-4"
                  inputClassName="!text-sm lg:!text-base"
                />
              </Window>
            </div>
            
            {/* Thread en plein écran sur mobile */}
            <Thread
              className="lg:w-96 !fixed lg:!relative inset-0 lg:inset-auto"
            />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;
