import React, {useState} from 'react';
import styles from './styles.module.css';

export interface DocFeedbackProps {
  question?: string;
  thankYouMessage?: string;
  githubRepo?: string;
  issueLabels?: string[];
}

type FeedbackType = 'positive' | 'negative' | null;

export default function DocFeedback({
  question = 'Was this page helpful?',
  thankYouMessage = 'Thank you for your feedback!',
  githubRepo,
  issueLabels = ['documentation', 'feedback'],
}: DocFeedbackProps): React.ReactElement {
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
  };

  const handleReportIssue = () => {
    if (typeof window === 'undefined' || !githubRepo) {
      return;
    }

    const pageTitle = document.title;
    const pageUrl = window.location.href;

    const issueTitle = `Documentation feedback: ${pageTitle}`;
    const issueBody = `**Page:** ${pageUrl}\n\n**Issue:**\n\n[Please describe the issue or suggestion here]\n\n---\n*This issue was created from the documentation feedback form.*`;

    const params = new URLSearchParams({
      title: issueTitle,
      body: issueBody,
      labels: issueLabels.join(','),
    });

    const githubUrl = `https://github.com/${githubRepo}/issues/new?${params.toString()}`;
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  };

  if (feedback) {
    return (
      <div className={styles.feedbackContainer} role="status" aria-live="polite">
        <p className={styles.thankYouMessage}>{thankYouMessage}</p>
        {githubRepo && (
          <button
            type="button"
            onClick={handleReportIssue}
            className={styles.reportIssueButton}
            aria-label="Report an issue on GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.icon}
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span className={styles.buttonLabel}>Report an issue</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.feedbackContainer}>
      <p className={styles.question}>{question}</p>
      <div className={styles.buttonGroup} role="group" aria-label="Page feedback">
        <button
          type="button"
          onClick={() => handleFeedback('positive')}
          className={styles.feedbackButton}
          aria-label="Yes, this page was helpful"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.icon}
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span className={styles.buttonLabel}>Yes</span>
        </button>

        <button
          type="button"
          onClick={() => handleFeedback('negative')}
          className={styles.feedbackButton}
          aria-label="No, this page was not helpful"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.icon}
          >
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
          </svg>
          <span className={styles.buttonLabel}>No</span>
        </button>
      </div>
    </div>
  );
}
