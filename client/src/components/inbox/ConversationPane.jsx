// client/src/components/ConversationPane.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import EmojiPicker from "emoji-picker-react";
import { User, Link, Unlink, Loader2, Paperclip, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon } from "lucide-react";

export default function ConversationPane({ conversation, socket, currentUser }) {
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [crmInfo, setCrmInfo] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwardContent, setForwardContent] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [forwardAttachments, setForwardAttachments] = useState([]);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [showForwardEmojiPicker, setShowForwardEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const forwardFileInputRef = useRef(null);
  const replyEditorRef = useRef(null);
  const forwardEditorRef = useRef(null);

  const getSenderEmail = useCallback(() => conv?.account?.email || localStorage.getItem("userEmail") || currentUser?.email || currentUser?.userEmail || null, [conv, currentUser]);

  const fetchConversation = useCallback(async () => {
    if (!conversation) return;
    try { 
      const res = await api.get(`/conversations/${conversation.id}`); 
      setConv(res.data); 
      setMessages(res.data.messages || []); 
    } 
    catch (err) { 
      console.error("Failed to fetch conversation:", err); 
    }
  }, [conversation]);

  const fetchCRMInfo = async (email) => {
    if (!email) return;
    setCrmLoading(true);
    try { 
      const res = await api.get(`/crm/match?email=${email}`); 
      setCrmInfo(res.data || null); 
    } 
    catch { 
      setCrmInfo(null); 
    }
    finally { 
      setCrmLoading(false); 
    }
  };

  useEffect(() => {
    if (!conversation) { 
      setConv(null); 
      setMessages([]); 
      return; 
    }
    fetchConversation();
    if (conversation?.from) fetchCRMInfo(conversation.from);
    socket.emit("join_conversation", { conversationId: conversation.id });
    return () => socket.emit("leave_conversation", { conversationId: conversation.id });
  }, [conversation, fetchConversation, socket]);

  // Update editor content when state changes
  useEffect(() => {
    if (replyEditorRef.current && replyEditorRef.current.innerHTML !== replyContent) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const cursorPosition = range ? range.startOffset : 0;
      
      replyEditorRef.current.innerHTML = replyContent;
      
      if (range && replyEditorRef.current.childNodes.length > 0) {
        try {
          range.setStart(replyEditorRef.current.childNodes[0], Math.min(cursorPosition, replyEditorRef.current.textContent.length));
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [replyContent]);

  useEffect(() => {
    if (forwardEditorRef.current && forwardEditorRef.current.innerHTML !== forwardContent) {
      forwardEditorRef.current.innerHTML = forwardContent;
    }
  }, [forwardContent]);

  const handleLinkToCRM = async (type) => { 
    setCrmLoading(true); 
    try { 
      await api.post("/crm/link",{
        email: conversation?.from,
        type,
        conversationId: conversation.id
      }); 
      fetchCRMInfo(conversation.from); 
    } catch { } 
    finally { 
      setCrmLoading(false); 
    } 
  };
  
  const handleUnlinkFromCRM = async () => { 
    setCrmLoading(true); 
    try { 
      await api.post("/crm/unlink",{
        conversationId: conversation.id
      }); 
      setCrmInfo(null); 
    } catch { } 
    finally { 
      setCrmLoading(false); 
    } 
  };

  const renderHTMLContent = (html) => ({ __html: html || "" });

  const handleReplyClick = (message) => { 
    const senderEmail = getSenderEmail();
    if (!senderEmail) {
      alert("No sender email configured. Please check your account settings.");
      return;
    }
    
    console.log('📝 Opening reply composer:', {
      senderEmail,
      replyingTo: message.from,
      messageId: message.messageId
    });
    
    setReplyingTo(message); 
    setIsReplyOpen(true); 
    setIsForwardOpen(false); 
    setReplyContent(""); 
    setAttachments([]);
    setShowReplyEmojiPicker(false);
  };

  const handleForwardClick = (message) => { 
    const senderEmail = getSenderEmail();
    if (!senderEmail) {
      alert("No sender email configured. Please check your account settings.");
      return;
    }
    
    console.log('📧 Opening forward composer:', {
      senderEmail,
      originalFrom: message.from
    });
    
    setForwardingMessage(message); 
    setIsForwardOpen(true); 
    setIsReplyOpen(false); 
    
    // Create a clean forwarded message with proper formatting
    const forwardedBody = `
      <br/><br/>
      <div style="border-left: 2px solid #ccc; padding-left: 10px; margin-top: 10px;">
        <p><strong>---------- Forwarded message ----------</strong></p>
        <p><strong>From:</strong> ${message.from}</p>
        <p><strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
        <p><strong>Subject:</strong> ${conv?.subject || '(no subject)'}</p>
        <br/>
        ${message.body}
      </div>
    `;
    
    setForwardContent(forwardedBody); 
    setForwardAttachments([]);
    setForwardTo("");
    setShowForwardEmojiPicker(false);
  };

  const sendMessage = async (body, inReplyTo = null, toEmail = null, files = [], isForward = false) => {
    console.log('📨 Sending message:', {
      bodyLength: body?.length,
      inReplyTo,
      toEmail,
      filesCount: files.length,
      isForward
    });

    // Validation
    if (!body || !body.trim()) {
      alert("Message body is required");
      return;
    }

    if (!toEmail || !toEmail.trim()) {
      alert("Recipient email is required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      alert("Please enter a valid recipient email address");
      return;
    }

    const senderEmail = getSenderEmail();
    if (!senderEmail) {
      alert("No sender email configured. Please check your account settings.");
      return;
    }

    if (!emailRegex.test(senderEmail)) {
      alert("Sender email is invalid. Please check your account settings.");
      return;
    }

    setIsSending(true);
    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append('body', body);
      formData.append('fromEmail', senderEmail);
      formData.append('fromName', senderEmail.split('@')[0]);
      formData.append('toEmail', toEmail);
      
      if (inReplyTo) {
        formData.append('inReplyTo', inReplyTo);
      }
      
      formData.append('isForward', isForward.toString());
      
      // Append files
      if (files && files.length > 0) {
        console.log('📎 Attaching files:', files.map(f => f.name));
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      console.log('📤 Submitting to API...');

      const res = await api.post(`/conversations/${conversation.id}/reply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Message sent successfully:', res.data);

      // Refresh conversation to get the new message
      await fetchConversation();
      
      // Clear states
      setAttachments([]); 
      setReplyContent(""); 
      setForwardContent(""); 
      setForwardTo(""); 
      setForwardAttachments([]);
      setIsReplyOpen(false);
      setIsForwardOpen(false);
      setShowReplyEmojiPicker(false);
      setShowForwardEmojiPicker(false);
      
      alert("Message sent successfully! ✅");
    } catch (err) { 
      console.error("❌ Failed to send:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || "Unknown error occurred";
      alert(`Failed to send message: ${errorMessage}`); 
    } finally { 
      setIsSending(false); 
    }
  };

  const handleSendReply = () => {
    const recipient = replyingTo?.from || replyingTo?.email;
    if (!recipient) {
      alert("Cannot determine recipient email");
      return;
    }
    
    console.log('📧 Sending reply to:', recipient);
    
    sendMessage(
      replyContent, 
      replyingTo?.messageId, 
      recipient, 
      attachments, 
      false
    );
  };

  const handleSendForward = () => { 
    if (!forwardContent.trim()) {
      alert("Message content is required");
      return;
    }
    
    if (!forwardTo.trim()) {
      alert("Recipient email is required");
      return;
    }
    
    // Validate recipient email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forwardTo)) {
      alert("Please enter a valid recipient email address");
      return;
    }
    
    console.log('📧 Forwarding message to:', forwardTo);
    
    sendMessage(
      forwardContent, 
      null, 
      forwardTo, 
      forwardAttachments, 
      true
    ); 
  };

  const handleAttachmentChange = (e, setFn) => {
    const files = Array.from(e.target.files);
    console.log('📎 Attachments selected:', files.length, files.map(f => `${f.name} (${(f.size / 1024).toFixed(1)}KB)`));
    setFn(prev => [...prev, ...files]);
    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (index, setFn) => {
    console.log('🗑️ Removing attachment at index:', index);
    setFn(prev => prev.filter((_, i) => i !== index));
  };

  const formatText = (command, value = null, editorRef, setContent) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    
    try {
      if (command === 'createLink' && value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, value);
      }
      
      // Update state after formatting
      setContent(editor.innerHTML);
    } catch (e) {
      console.error('Format error:', e);
    }
  };

  const insertLink = (editorRef, setContent) => { 
    const url = prompt("Enter URL:"); 
    if (url) {
      formatText('createLink', url, editorRef, setContent);
    }
  };

  const insertEmoji = (emoji, editorRef, setContent) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    
    // Insert emoji at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // No selection, append to end
      editor.innerHTML += emoji;
    }
    
    setContent(editor.innerHTML);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-400">
        <p>Select a conversation to view messages</p>
      </div>
    );
  }

  const ActionButtons = ({ area, editorRef, setContent, fileInputRef, showEmojiPicker, setShowEmojiPicker }) => {
    const buttons = [
      { icon: <Bold className="w-4 h-4"/>, cmd: 'bold', title: 'Bold' },
      { icon: <Italic className="w-4 h-4"/>, cmd: 'italic', title: 'Italic' },
      { icon: <Underline className="w-4 h-4"/>, cmd: 'underline', title: 'Underline' },
      { icon: <List className="w-4 h-4"/>, cmd: 'insertUnorderedList', title: 'Bullet List' },
      { icon: <ListOrdered className="w-4 h-4"/>, cmd: 'insertOrderedList', title: 'Numbered List' },
      { 
        icon: <LinkIcon className="w-4 h-4"/>, 
        cmd: 'link', 
        title: 'Link', 
        action: () => insertLink(editorRef, setContent) 
      },
      { 
        icon: '😊', 
        cmd: 'emoji', 
        title: 'Emoji', 
        action: () => setShowEmojiPicker(prev => !prev) 
      },
    ];

    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {buttons.map((b, i) => (
          <button 
            key={i} 
            onClick={() => {
              if (b.action) {
                b.action();
              } else {
                formatText(b.cmd, null, editorRef, setContent);
              }
            }} 
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors" 
            title={b.title}
            type="button"
          >
            {b.icon}
          </button>
        ))}
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors" 
          title="Attach"
          type="button"
        >
          <Paperclip className="w-4 h-4"/>
        </button>
      </div>
    );
  };

  const Attachments = ({ files, removeFn, isExisting = false }) => (
    files.length > 0 && (
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-400 mb-1">Attachments:</h4>
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs">
              <Paperclip className="w-3 h-3"/>
              <span>{isExisting ? f.filename : f.name}</span>
              <span className="text-gray-500">
                ({((isExisting ? f.size : f.size) / 1024).toFixed(1)}KB)
              </span>
              {!isExisting && (
                <button 
                  onClick={() => removeFn(i)} 
                  className="ml-1 text-red-400 hover:text-red-300"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  );

  const EditorBox = ({ 
    area, 
    content, 
    setContent, 
    files, 
    setFiles, 
    sendFn, 
    cancelFn, 
    toInput,
    editorRef,
    fileInputRef,
    showEmojiPicker,
    setShowEmojiPicker
  }) => (
    <div className="bg-gray-900 border-t border-gray-800 p-4 sticky bottom-0 z-10">
      {toInput && (
        <input 
          type="email" 
          value={forwardTo} 
          onChange={e => setForwardTo(e.target.value)} 
          placeholder="Recipient email (e.g., recipient@example.com)" 
          className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white mb-3 focus:outline-none focus:border-blue-500"
        />
      )}
      
      <ActionButtons 
        area={area} 
        editorRef={editorRef}
        setContent={setContent}
        fileInputRef={fileInputRef}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
      />
      
      <div 
        ref={editorRef}
        id={`${area}-editor`} 
        contentEditable 
        onInput={e => setContent(e.currentTarget.innerHTML)} 
        className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white resize-none min-h-[120px] max-h-60 overflow-y-auto focus:outline-none focus:border-blue-500"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      
      <Attachments files={files} removeFn={(i) => removeAttachment(i, setFiles)}/>
      
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-10 z-20">
          <EmojiPicker 
            onEmojiClick={e => {
              insertEmoji(e.emoji, editorRef, setContent);
              setShowEmojiPicker(false);
            }} 
            theme="dark"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3">
        <button 
          onClick={cancelFn} 
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          type="button"
        >
          Cancel
        </button>
        <button 
          onClick={sendFn} 
          disabled={isSending || !content.trim() || (area === 'forward' && !forwardTo.trim())} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          type="button"
        >
          {isSending && <Loader2 className="w-4 h-4 animate-spin"/>}
          {isSending ? "Sending..." : area === 'reply' ? "Send Reply" : "Forward"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-950 text-white relative">
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-800 bg-gray-900 shadow-lg">
        <h1 className="text-xl font-semibold text-white">{conv?.subject || "No Subject"}</h1>
        <p className="text-sm text-gray-400">From: {messages[0]?.fromName || messages[0]?.from}</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-3">
          {messages.map(m => (
            <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{m.from}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReplyClick(m)} 
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    ↩️ Reply
                  </button>
                  <button 
                    onClick={() => handleForwardClick(m)} 
                    className="text-green-400 hover:text-green-300 text-xs transition-colors"
                  >
                    ↪️ Forward
                  </button>
                </div>
              </div>
              <div 
                className="mt-3 text-gray-200" 
                dangerouslySetInnerHTML={renderHTMLContent(m.body)}
              />
              {m.attachments?.length > 0 && (
                <Attachments files={m.attachments} removeFn={() => {}} isExisting={true}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {isReplyOpen && (
        <EditorBox 
          area="reply" 
          content={replyContent} 
          setContent={setReplyContent} 
          files={attachments} 
          setFiles={setAttachments} 
          sendFn={handleSendReply} 
          cancelFn={() => {
            setIsReplyOpen(false);
            setShowReplyEmojiPicker(false);
          }}
          editorRef={replyEditorRef}
          fileInputRef={fileInputRef}
          showEmojiPicker={showReplyEmojiPicker}
          setShowEmojiPicker={setShowReplyEmojiPicker}
        />
      )}

      {isForwardOpen && (
        <EditorBox 
          area="forward" 
          content={forwardContent} 
          setContent={setForwardContent} 
          files={forwardAttachments} 
          setFiles={setForwardAttachments} 
          sendFn={handleSendForward} 
          cancelFn={() => {
            setIsForwardOpen(false);
            setShowForwardEmojiPicker(false);
          }}
          toInput={true}
          editorRef={forwardEditorRef}
          fileInputRef={forwardFileInputRef}
          showEmojiPicker={showForwardEmojiPicker}
          setShowEmojiPicker={setShowForwardEmojiPicker}
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={e => handleAttachmentChange(e, setAttachments)} 
        multiple 
        className="hidden"
      />
      <input 
        type="file" 
        ref={forwardFileInputRef} 
        onChange={e => handleAttachmentChange(e, setForwardAttachments)} 
        multiple 
        className="hidden"
      />
    </div>
  );
}