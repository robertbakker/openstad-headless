import React from 'react';
import {
  Icon,
  Image,
  List,
  PlainButton,
  SecondaryButton,
  Spacer,
} from '@openstad-headless/ui/src';

import { elipsize } from '@openstad-headless/lib/ui-helpers';

export const StemBegrootResourceList = ({
  resources,
  onResourcePlainClicked,
  onResourcePrimaryClicked,
  resourceBtnEnabled,
  resourceBtnTextHandler,
  defineOriginalUrl,
  displayPriceLabel = true,
  displayRanking = true,
  showVoteCount = true,
}: {
  resources: Array<any>;
  selectedResources: Array<any>;
  onResourcePlainClicked: (resource: any, index: number) => void;
  onResourcePrimaryClicked: (resource: any) => void;
  resourceBtnTextHandler: (resource: any) => string;
  resourceBtnEnabled: (resource: any) => boolean;
  defineOriginalUrl: (resource: any) => string | null;
  displayPriceLabel?: boolean;
  displayRanking?: boolean;
  showVoteCount?: boolean;
  showOriginalResource?: boolean;
  originalResourceUrl?: string;
}) => {
  return (
    <List
      id='stem-begroot-resource-selections-list'
      columns={3}
      items={resources || []}
      renderHeader={() => (
        <>
          <h3>Plannen</h3> <Spacer size={1} />
        </>
      )}
      renderItem={(resource, index) => {
        const primaryBtnText = resourceBtnTextHandler(resource);
        const primaryBtnDisabled = !resourceBtnEnabled(resource);
        const originalUrl = defineOriginalUrl(resource);

        const theme = resource.tags
          ?.filter((t: any) => t.type === 'theme')
          ?.at(0);
        const area = resource.tags
          ?.filter((t: any) => t.type === 'area')
          ?.at(0);


        return (
          <>
            <article>
              <Image src={resource.images?.at(0)?.src || ''} />

              <div>
                <Spacer size={1} />
                <section className="stembegroot-content-item-header">
                  {displayPriceLabel ? (
                    <h5>&euro;{resource.budget || 0}</h5>
                  ) : null}
                  <div className="stembegroot-content-item-header-taglist">
                    <p className="strong">Thema:</p>
                    <p>{theme?.name || 'Geen thema'}</p>
                    <p className="strong">Gebied:</p>
                    <p> {area?.name || 'Geen gebied'}</p>
                  </div>
                </section>

                <Spacer size={0.5} />

                <p>{elipsize(resource.description, 200)}</p>

                <Spacer size={1} />
              </div>

              {originalUrl ? (
                <>
                  <p className="strong">
                    Dit een vervolg op plan:&nbsp;
                    <a target="_blank" href={originalUrl}>
                      {originalUrl}
                    </a>
                  </p>
                </>
              ) : null}

              {showVoteCount ? (
                <div className="osc-stem-begroot-content-item-footer">
                  <>
                    <Icon
                      icon="ri-thumb-up-line"
                      variant="regular"
                      text={resource.yes}
                    />
                    <Icon
                      icon="ri-thumb-down-line"
                      variant="regular"
                      text={resource.no}
                    />
                    {displayRanking && resource.extraData?.ranking ? (
                      <Icon
                        icon="ri-trophy-line"
                        variant="regular"
                        text={resource.extraData?.ranking}
                      />
                    ) : null}
                  </>
                </div>
              ) : null}

              <div className="osc-stem-begroot-content-item-footer">
                <PlainButton
                  className="osc-stem-begroot-item-action-btn"
                  onClick={() => {
                    onResourcePlainClicked(resource, index);
                  }}>
                  Lees meer
                </PlainButton>
                <SecondaryButton
                  disabled={primaryBtnDisabled}
                  className="osc-stem-begroot-item-action-btn"
                  onClick={() => {
                    onResourcePrimaryClicked(resource);
                  }}>
                  {primaryBtnText}
                </SecondaryButton>
              </div>
            </article>
          </>
        );
      }}
    />
  );
};
