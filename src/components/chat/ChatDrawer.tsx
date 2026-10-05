import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Conversation } from '../../types';
import {
  X,
  Send,
  MessageSquare,
  ShoppingBag,
  CheckCheck,
  Store,
  Sparkles
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  activeConversationId
}) => {
  const { currentUser } = useAuth();
  const { conversations, sendMessage, markConversationAsRead } = useMarketplace();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations where current user is buyer or seller
  const userConversations = conversations.filter(
    (c) => c.buyer_id === currentUser?.id || c.seller_id === currentUser?.id
  );

  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvId(activeConversationId);
    } else if (userConversations.length > 0 && !selectedConvId) {
      setSelectedConvId(userConversations[0].id);
    }
  }, [activeConversationId, userConversations]);

  useEffect(() => {
    if (selectedConvId) {
      markConversationAsRead(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations]);

  if (!isOpen) return null;

  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !inputText.trim()) return;

    sendMessage(selectedConvId, inputText);
    setInputText('');

    // Simulate realistic seller instant peer response after 2 seconds if current user is buyer
    if (activeConversation && activeConversation.buyer_id === currentUser?.id) {
      setTimeout(() => {
        const autoReplies = [
          'Hey! Thanks for messaging. Yes, this item is available! Where are you located on campus?',
          'Got your message! I can meet between lectures at the Student Union or North Quad.',
          'Sounds good! Let me know what time works best for you today.'
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        sendMessage(selectedConvId, randomReply);
      }, 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-stone-200 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Sidebar: Conversations List */}
          <div className="w-full md:w-64 border-r border-stone-200 flex flex-col bg-stone-50">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Student Messages</span>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {userConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  No active conversations yet. Click "Message Seller" on any listing.
                </div>
              ) : (
                userConversations.map((conv) => {
                  const isCurrentBuyer = conv.buyer_id === currentUser?.id;
                  const otherPartyName = isCurrentBuyer ? conv.store_name : conv.buyer_name;
                  const isUnread = isCurrentBuyer ? conv.unread_by_buyer : conv.unread_by_seller;
                  const isSelected = conv.id === selectedConvId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full text-left p-3.5 transition-colors flex items-start gap-2.5 ${
                        isSelected ? 'bg-white shadow-xs' : 'hover:bg-stone-100/70'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {otherPartyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${isUnread ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                            {otherPartyName}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {conv.last_message || 'Start chatting...'}
                        </p>
                        {conv.product_name && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 truncate mt-1">
                            <ShoppingBag className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate">{conv.product_name}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right / Chat Panel */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              {activeConversation ? (
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {activeConversation.buyer_id === currentUser?.id
                      ? activeConversation.store_name
                      : activeConversation.buyer_name}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Active on campus · Peer-to-peer inquiry
                  </p>
                </div>
              ) : (
                <div className="text-sm font-semibold text-stone-500">Select a chat</div>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Reference Banner */}
            {activeConversation?.product_name && (
              <div className="p-2.5 bg-amber-50/70 border-b border-amber-100 flex items-center gap-2.5 text-xs text-amber-950">
                {activeConversation.product_image && (
                  <img
                    src={activeConversation.product_image}
                    alt={activeConversation.product_name}
                    className="w-8 h-8 rounded object-cover border border-amber-200"
                  />
                )}
                <div className="truncate flex-1">
                  <span className="font-semibold">Inquiring about:</span>{' '}
                  <span className="truncate">{activeConversation.product_name}</span>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/40">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  Send a message to coordinate pickup location, question specs, or ask for availability.
                </div>
              ) : (
                activeConversation.messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.sender_avatar}
                          alt={msg.sender_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                        />
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-stone-900 text-white rounded-br-xs'
                            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[10px] font-bold text-stone-500 mb-0.5">
                            {msg.sender_name}
                          </p>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <p
                          className={`text-[9px] text-right mt-1 ${
                            isMe ? 'text-stone-400' : 'text-stone-400'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {activeConversation && (
              <form onSubmit={handleSend} className="p-3 border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to student..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
