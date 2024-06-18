/**
 * queue names
 */
const QUEUE_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT = 'SendMailTempleCreateEvent';

/**
 * job names
 */

const JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT = 'SendMailTempleCreateEvent';

export const QUEUE_MODULE_OPTIONS = {
  SEND_MAIL_TEMPLE_CREATE_EVENT: {
    NAME: QUEUE_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT as TQueueName,
    JOBS: {
      SEND_MAIL: JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT as TJobName,
    },
  },
};

/**
 * type queue name
 */
export type TQueueName = typeof QUEUE_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT;

/**
 * type job name
 */
export type TJobName = typeof JOB_NAME_SEND_MAIL_TEMPLE_CREATE_EVENT;
