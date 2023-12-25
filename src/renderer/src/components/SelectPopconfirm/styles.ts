import styled from 'styled-components';

export const PopoverContentWrapper = styled.div`
  width: 100%;
  padding: 6px 8px;
  box-sizing: border-box;

  .input-popover-content-header {
    display: flex;
    align-items: start;
    width: 100%;
    font-size: 14px;

    .icon {
      flex: none;
      margin-right: 8px;
      color: #F6D24C;
    }

    .header-right {
      flex: 1 1 0;

      .title {
        margin-bottom: 12px;
      }

      .desc {
        margin-bottom: 16px
      }

      .input {
        width: 100%;
        margin-bottom: 16px;
        box-sizing: border-box;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: end;
    width: 100%;

    > :not(:last-child) {
      margin-right: 8px;
    }
  }
`;

