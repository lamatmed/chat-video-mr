import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { ArrowLeftIcon, BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { useNavigate } from "react-router";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Mobile back button */}
        <div className="lg:hidden mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="size-4 mr-2" />
            Retour
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Demandes d'amis
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-base-300">
                              <img src={request.sender.profilePic} alt={request.sender.fullName} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm text-xs">
                                  Langue maternelle: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm text-xs">
                                  Apprentissage: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm w-full sm:w-auto"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accepter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  Nouvelles Connexions
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.profilePic}
                              alt={notification.recipient.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{notification.recipient.fullName}</h3>
                            <p className="text-xs sm:text-sm my-1">
                              {notification.recipient.fullName} a accepté votre demande d'ami
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Récemment
                            </p>
                          </div>
                          <div className="badge badge-success text-xs">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            Nouvel Ami
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
