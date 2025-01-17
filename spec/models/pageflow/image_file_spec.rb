require 'spec_helper'

module Pageflow
  describe ImageFile do
    it 'is invalid if attachment is missing' do
      image_file = build(:image_file, :uploading, file_name: nil)

      image_file.valid?
      expect(image_file).to have(1).errors_on(:attachment_on_s3)
    end

    it 'is valid if attachment is present' do
      image_file = build(:image_file, :uploading)

      expect(image_file).to be_valid
    end

    describe 'attachment_styles' do
      it 'includes Pageflow.config.thumbnail_styles' do
        Pageflow.config.thumbnail_styles[:square] = '100x100'

        image_file = build(:image_file, :uploading, file_name: 'image.jpg')
        styles = image_file.attachment_styles(image_file.attachment)

        expect(styles[:square]).to eq('100x100')
      end

      it 'turns png file into jpg for non panorama styles' do
        image_file = build(:image_file, :uploading, file_name: 'image.png')
        styles = image_file.attachment_styles(image_file.attachment)

        expect(styles[:medium][:format]).to eq(:JPG)
      end

      it 'preserves png file extension for panorama styles' do
        image_file = build(:image_file, :uploading, file_name: 'image.png')
        styles = image_file.attachment_styles(image_file.attachment)

        expect(styles[:panorama_large][:format]).to eq(:PNG)
      end

      it 'preserves jpg file extension for panorama styles' do
        image_file = build(:image_file, :uploading, file_name: 'image.jpg')
        styles = image_file.attachment_styles(image_file.attachment)

        expect(styles[:panorama_large][:format]).to eq(:JPG)
      end

      it 'turns gif file into jpg for panorama styles' do
        image_file = build(:image_file, :uploading, file_name: 'image.gif')
        styles = image_file.attachment_styles(image_file.attachment)

        expect(styles[:panorama_large][:format]).to eq(:JPG)
      end

      it 'resizes panorama if original is larger than target in both dimensions' do
        image_file = build(:image_file, :uploading, width: 3000, height: 1500)
        styles = image_file.attachment.styles

        expect(styles[:panorama_large].processor_options[:geometry]).to eq('1920x1080^')
        expect(styles[:panorama_medium].processor_options[:geometry]).to eq('1024x1024^')
      end

      it 'does not resize panorama if original is smaller than target in one dimensions' do
        image_file = build(:image_file, :uploading, width: 2000, height: 1000)
        styles = image_file.attachment.styles

        expect(styles[:panorama_large].processor_options[:geometry]).to eq('100%')
        expect(styles[:panorama_medium].processor_options[:geometry]).to eq('100%')
      end
    end

    describe 'basename' do
      it 'returns the original file name without extention' do
        image_file = build(:image_file, :uploading, file_name: 'image.jpg')

        expect(image_file.basename).to eq('image')
      end
    end

    describe 'thumbnail_url' do
      it 'returns a placeholder unless image is processed' do
        image_file = build(:image_file, :uploading, file_name: 'image.jpg')

        expect(image_file.thumbnail_url(:medium)).to match(/placeholder/)
      end
    end
  end
end
