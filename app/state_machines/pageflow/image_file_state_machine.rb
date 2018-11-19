module Pageflow
  module ImageFileStateMachine
    extend ActiveSupport::Concern

    included do
      processing_state_machine do
        extend StateMachineJob::Macro

        state 'processing'
        state 'processed'
        state 'processing_failed'

        event :process do
          transition any => 'processing'
        end

        job ProcessFileJob do
          on_enter 'processing'
          result :ok => 'processed'
          result :error => 'processing_failed'
        end
      end
    end

    def retry!
      process!
    end

    def publish!
      process!
    end

    def retryable?
      processing_failed?
    end

    def ready?
      processed?
    end
  end
end
