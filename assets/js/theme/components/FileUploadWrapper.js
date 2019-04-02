import $ from 'jquery';

export default class FileUploadWrapper {
  constructor(el, context) {
    this.$el = $(el);
    this.$parent = this.$el.parent('.form-file-wrapper');
    this.context = context;

    // only run if wrapper is in place
    if (this.$parent.length) {
      this._init();
    }
  }

  _init() {
    this.$el.before(`<span class="form-selected-file"></span>`);
    this._bindEvents();
  }

  _bindEvents() {
    this.$el.on('change', () => {
      this.updateFilename();
    });
  }

  updateFilename() {
    const newOption = this.$el.val() ? this.$el.val().replace(/C:\\fakepath\\/i, '') : this.context.chooseFile;
    this.$el.siblings('.form-selected-file').text(newOption);
  }
}
