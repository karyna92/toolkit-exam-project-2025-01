import React from 'react';
import { connect } from 'react-redux';
import { getPreviewChat } from '../../../../store/slices/chatSlice';
import DialogList from '../DialogList/DialogList';

class DialogListContainer extends React.Component {
  componentDidMount() {
    this.props.getChatPreview();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.someProp !== this.props.someProp) {
    }
  }

  render() {
    const { messagesPreview, userId, onFavoriteToggle, onBlockToggle } =
      this.props;
    return (
      <DialogList
        preview={messagesPreview}
        userId={userId}
        onFavoriteToggle={onFavoriteToggle}
        onBlockToggle={onBlockToggle}
      />
    );
  }
}

const mapStateToProps = (state) => state.chatStore;

const mapDispatchToProps = (dispatch) => ({
  getChatPreview: () => dispatch(getPreviewChat()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DialogListContainer);
