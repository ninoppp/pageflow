module PageflowScrolled
  class Chapter < Pageflow::ApplicationRecord
    include Pageflow::SerializedConfiguration
    include Pageflow::AutoGeneratedPermaId

    has_many :sections, -> { order('position ASC') }, dependent: :destroy, inverse_of: :chapter
  end
end
