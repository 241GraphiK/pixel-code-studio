import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useConversations, useMessages, createConversation, type Conversation, type Message } from "@/hooks/use-messages";
import { usePresence } from "@/hooks/use-presence";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Plus, Search, ArrowLeft, Trash2, Reply, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { OnlineIndicator } from "@/components/messages/OnlineIndicator";
import { MessageAttachment } from "@/components/messages/MessageAttachment";
import { ChatInput } from "@/components/messages/ChatInput";
import { MessageReactions, useReactions } from "@/components/messages/MessageReactions";
import { useTypingIndicator } from "@/hooks/use-typing";

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const { conversations, loading: convsLoading, refetch } = useConversations();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const { messages, loading: msgsLoading, sendMessage, deleteMessage } = useMessages(selectedConvId);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline } = usePresence();
  const { fetchReactions, toggleReaction, getReactions } = useReactions(selectedConvId);
  const { typingNames, sendTyping, sendStopTyping } = useTypingIndicator(selectedConvId, user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      fetchReactions(messages.map(m => m.id));
    }
  }, [messages.length, selectedConvId]);

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setShowMobileChat(true);
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.user_id !== user?.id) || conv.participants[0];
  };

  const filteredConvs = conversations.filter(conv => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground text-sm">Communiquez avec vos enseignants et étudiants</p>
        </div>

        <Card className="flex-1 flex overflow-hidden">
          {/* Conversation list */}
          <div className={cn(
            "w-full md:w-80 border-r border-border flex flex-col",
            showMobileChat && "hidden md:flex"
          )}>
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <NewConversationDialog
                userId={user?.id}
                isOnline={isOnline}
                onCreated={(convId) => { refetch(); setSelectedConvId(convId); setShowMobileChat(true); }}
              />
            </div>

            <ScrollArea className="flex-1">
              {convsLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Chargement...</div>
              ) : filteredConvs.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune conversation</p>
                </div>
              ) : (
                filteredConvs.map(conv => {
                  const other = getOtherParticipant(conv);
                  const initials = other?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
                  const otherOnline = isOnline(other?.user_id || "");
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left",
                        selectedConvId === conv.id && "bg-accent"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={other?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        <OnlineIndicator isOnline={otherOnline} className="absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">{other?.name}</p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(conv.lastMessage.created_at), "HH:mm", { locale: fr })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage?.attachment_url
                              ? `📎 ${conv.lastMessage?.attachment_name || "Fichier"}`
                              : conv.lastMessage?.content || "Nouvelle conversation"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !showMobileChat && "hidden md:flex"
          )}>
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getOtherParticipant(selectedConv)?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <OnlineIndicator
                      isOnline={isOnline(getOtherParticipant(selectedConv)?.user_id || "")}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{getOtherParticipant(selectedConv)?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isOnline(getOtherParticipant(selectedConv)?.user_id || "")
                        ? <span className="text-green-600 dark:text-green-400">En ligne</span>
                        : (getOtherParticipant(selectedConv)?.role === "teacher" ? "Enseignant" : "Étudiant")}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map(msg => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={cn("flex group items-end gap-1", isMe ? "justify-end" : "justify-start")}>
                          {isMe && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                              <button
                                onClick={() => setReplyTo(msg)}
                                className="p-1 rounded hover:bg-accent"
                                title="Répondre"
                              >
                                <Reply className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="p-1 rounded hover:bg-accent" title="Supprimer">
                                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Le message sera supprimé définitivement.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMessage(msg.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                          {!isMe && (
                            <div className="order-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                              <button
                                onClick={() => setReplyTo(msg)}
                                className="p-1 rounded hover:bg-accent"
                                title="Répondre"
                              >
                                <Reply className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                          )}
                          <div className={cn("flex flex-col", !isMe && "order-1")}>
                            {/* Quoted reply */}
                            {msg.reply_to_id && (() => {
                              const repliedMsg = messages.find(m => m.id === msg.reply_to_id);
                              if (!repliedMsg) return null;
                              return (
                                <div className={cn(
                                  "text-[11px] px-3 py-1.5 rounded-t-lg border-l-2 border-primary/50 mb-0.5",
                                  isMe
                                    ? "bg-primary/20 text-primary-foreground/80 ml-auto"
                                    : "bg-muted/80 text-muted-foreground"
                                )}>
                                  <p className="font-medium text-[10px]">{repliedMsg.sender?.name}</p>
                                  <p className="truncate max-w-[200px]">{repliedMsg.content}</p>
                                </div>
                              );
                            })()}
                            <div className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md ml-auto"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}>
                              {msg.attachment_url && msg.attachment_name && msg.attachment_type && (
                                <div className="mb-1">
                                  <MessageAttachment
                                    url={msg.attachment_url}
                                    name={msg.attachment_name}
                                    type={msg.attachment_type}
                                    isMe={isMe}
                                  />
                                </div>
                              )}
                              {msg.content && msg.content !== msg.attachment_name && (
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              )}
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                isMe ? "justify-end" : ""
                              )}>
                                <p className={cn(
                                  "text-[10px]",
                                  isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                                </p>
                                {isMe && (
                                  msg.read
                                    ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                                    : <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                                )}
                              </div>
                            </div>
                            <MessageReactions
                              messageId={msg.id}
                              reactions={getReactions(msg.id)}
                              isMe={isMe}
                              onToggle={toggleReaction}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                    {typingNames.length > 0 && (
                      <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-xs text-muted-foreground italic">
                          {typingNames.join(", ")} écrit...
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <ChatInput
                  conversationId={selectedConvId!}
                  replyTo={replyTo}
                  onClearReply={() => setReplyTo(null)}
                  onSendMessage={sendMessage}
                  onTyping={() => sendTyping(profile?.name || "Utilisateur")}
                  onStopTyping={sendStopTyping}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function NewConversationDialog({ userId, isOnline, onCreated }: { userId?: string; isOnline: (id: string) => boolean; onCreated: (convId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string; role: string; avatar_url: string | null }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, name, role, avatar_url")
      .neq("id", userId)
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, [open, userId]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (otherUserId: string) => {
    if (!userId) return;
    try {
      const convId = await createConversation(userId, otherUserId);
      setOpen(false);
      onCreated(convId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>Sélectionnez un utilisateur pour démarrer une conversation</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ScrollArea className="max-h-64">
          {loading ? (
            <p className="text-sm text-muted-foreground p-2">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">Aucun utilisateur trouvé</p>
          ) : (
            filtered.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelect(u.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {u.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator isOnline={isOnline(u.id)} className="absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {u.role === "teacher" ? "Enseignant" : u.role === "admin" ? "Admin" : "Étudiant"}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
