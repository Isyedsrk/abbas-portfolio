import { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaCommentDots } from "react-icons/fa";

/** Fired when the welcome modal closes — ChatButton listens to pulse the FAB. */
export const HIGHLIGHT_PROJECT_CHAT_BUTTON_EVENT = "abbas-highlight-project-chat";

const ProjectAiAssistantModal = () => {
  /** Open on each visit to Projects (including full page refresh); closes until next load. */
  const [open, setOpen] = useState(true);

  const dismiss = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new Event(HIGHLIGHT_PROJECT_CHAT_BUTTON_EVENT));
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="project-ai-modal-backdrop"
      role="presentation"
      onClick={dismiss}
    >
      <div
        className="project-ai-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-ai-modal-title"
        aria-describedby="project-ai-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="project-ai-modal__close btn btn-link border-0 p-0"
          onClick={dismiss}
          aria-label="Close"
        >
          <FaTimes size={22} />
        </button>

        <div className="project-ai-modal__icon-wrap" aria-hidden>
          <FaWandMagicSparkles className="project-ai-modal__icon" />
        </div>

        <h2 id="project-ai-modal-title" className="project-ai-modal__title">
          Meet your project guide
        </h2>
        <p id="project-ai-modal-desc" className="project-ai-modal__text">
          Have a question about any of these projects—tech stack, features, or
          how something was built? Ask the{" "}
          <strong className="text-warning">AI assistant</strong>. It knows this
          portfolio and can point you to details or suggest what to explore
          next.
        </p>
        <p className="project-ai-modal__hint mb-0">
          <FaCommentDots className="project-ai-modal__hint-icon" aria-hidden />
          Tap the gold chat button in the corner anytime.
        </p>
      </div>
    </div>
  );
};

export default ProjectAiAssistantModal;
