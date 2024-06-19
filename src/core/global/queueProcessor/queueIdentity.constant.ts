/**
 * queue names
 */
const QUEUE_NAME_SEND_MAIL_EVENT = 'SendMailTempleCreateEvent';
/**
 * job names
 */

const JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT = 'SendMailTempleCreateEvent';
const JOB_NAME_SEND_MAIL_TEMPLE_UPDATE_EVENT = 'SendMailTempleUpdateEvent';
const JOB_NAME_SEND_MAIL_TEMPLE_CANCEL_EVENT = 'SendMailTempleCancelEvent';

export const QUEUE_MODULE_OPTIONS = {
  SEND_MAIL_TEMPLE_CREATE_EVENT: {
    NAME: QUEUE_NAME_SEND_MAIL_EVENT as TQueueName,
    JOBS: {
      SEND_MAIL: JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT as TJobName,
    },
  },
  SEND_MAIL_TEMPLE_UPDATE_EVENT: {
    NAME: QUEUE_NAME_SEND_MAIL_EVENT as TQueueName,
    JOBS: {
      SEND_MAIL: JOB_NAME_SEND_MAIL_TEMPLE_UPDATE_EVENT as TJobName,
    },
  },
  SEND_MAIL_TEMPLE_CANCEL_EVENT: {
    NAME: QUEUE_NAME_SEND_MAIL_EVENT as TQueueName,
    JOBS: {
      SEND_MAIL: JOB_NAME_SEND_MAIL_TEMPLE_CANCEL_EVENT as TJobName,
    },
  },
};

/**
 * type queue name
 */
export type TQueueName =
  | typeof QUEUE_NAME_SEND_MAIL_EVENT
  | typeof QUEUE_NAME_SEND_MAIL_EVENT;

/**
 * type job name
 */
export type TJobName =
  | typeof JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT
  | typeof JOB_NAME_SEND_MAIL_TEMPLE_UPDATE_EVENT;
