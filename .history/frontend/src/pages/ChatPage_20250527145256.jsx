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
            {/* Déplacer le CallButton en dehors de la fenêtre principale */}
            <div className="absolute top-4 right-4 z-10">
              <CallButton handleVideoCall={handleVideoCall} />
            </div>

            <div className="w-full h-full flex flex-col">
              <Window>
                {/* Ajouter un padding pour l'en-tête */}
                <ChannelHeader className="pt-4 px-4" />
                
                {/* Conteneur des messages avec padding */}
                <div className="flex-1 overflow-y-auto p-4">
                  <MessageList />
                </div>

                {/* Input avec marge */}
                <div className="m-4">
                  <MessageInput focus />
                </div>
              </Window>
            </div>

            {/* Thread */}
            <Thread className="lg:w-96 !fixed lg:!relative inset-0 lg:inset-auto" />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;
