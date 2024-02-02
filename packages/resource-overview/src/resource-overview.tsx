import './resource-overview.css';
import React, { useCallback, useState } from 'react';
import { Banner, Carousel, Icon } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { Filters } from './filters/filters';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { elipsize } from '../../lib/ui-helpers';
import { GridderResourceDetail } from './gridder-resource-detail';
import { hasRole } from '@openstad-headless/lib';
import nunjucks from 'nunjucks';

export type ResourceOverviewWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    renderHeader?: (resources?: Array<any>) => React.JSX.Element;
    renderItem?: (
      resource: any,
      props: ResourceOverviewWidgetProps,
      onItemClick?: () => void
    ) => React.JSX.Element;
    resourceType?: 'resource';
    displayType?: 'cardrow' | 'cardgrid' | 'raw';
    allowFiltering?: boolean;
    displayTitle?: boolean;
    titleMaxLength?: number;
    displayRanking?: boolean;
    displayLabel?: boolean;
    displaySummary?: boolean;
    summaryMaxLength?: number;
    displayDescription?: boolean;
    descriptionMaxLength?: number;
    displayArguments?: boolean;
    displayVote?: boolean;
    displayShareButtons?: boolean;
    displayEditLink?: boolean;
    displayCaption?: boolean;
    summaryCharLength?: number;
    displaySorting?: boolean;
    defaultSorting?: string;
    displaySearch?: boolean;
    displaySearchText?: boolean;
    textActiveSearch?: string;
    itemLink?: string;
    sorting: Array<{ value: string; label: string }>;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
    displayBanner?: boolean;
    itemsPerPage?: number;
    textResults?: string;
    onlyIncludeTagIds?: string;
    rawInput?: string;
  };

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner>
        <Spacer size={12} />
      </Banner>
      <section className="osc-resource-overview-title-container">
        <Spacer size={2} />
        <h4>Plannen</h4>
      </section>
    </>
  );
};

const defaultItemRenderer = (
  resource: any,
  props: ResourceOverviewWidgetProps,
  onItemClick?: () => void
) => {
  if (props.displayType === 'raw') {
    if (!props.rawInput) {
      return <p>Template is nog niet ingesteld</p>;
    }
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: nunjucks.renderString(props.rawInput, {
            // here you can add variables that are available in the template
            projectId: props.projectId,
            user: resource.user,
            startDateHumanized: resource.startDateHumanized,
            status: resource.status,
            title: resource.title,
            summary: resource.summary,
            description: resource.description,
            images: resource.images,
            budget: resource.budget,
            extraData: resource.extraData,
            location: resource.location,
            modBreak: resource.modBreak,
            modBreakDateHumanized: resource.modBreakDateHumanized,
            progress: resource.progress,
            createDateHumanized: resource.createDateHumanized,
            publishDateHumanized: resource.publishDateHumanized,
          }),
        }}></div>
    );
  }

  return (
    <article onClick={() => onItemClick && onItemClick()}>
      <Image
        src={resource.images?.at(0)?.src || ''}
        imageFooter={
          <div>
            <p className="osc-resource-overview-content-item-status">
              {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </p>
          </div>
        }
      />

      <div>
        <Spacer size={1} />
        {props.displayTitle ? (
          <h6>{elipsize(resource.title, props.titleMaxLength || 20)}</h6>
        ) : null}

        {props.displaySummary ? (
          <h6>{elipsize(resource.summary, props.summaryMaxLength || 20)}</h6>
        ) : null}

        {props.displayDescription ? (
          <p className="osc-resource-overview-content-item-description">
            {elipsize(resource.description, props.descriptionMaxLength || 30)}
          </p>
        ) : null}
      </div>

      <div className="osc-resource-overview-content-item-footer">
        {props.displayVote ? (
          <>
            <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} />
            <Icon icon="ri-thumb-down-line" variant="big" text={resource.yes} />
          </>
        ) : null}

        {props.displayArguments ? (
          <Icon icon="ri-message-line" variant="big" text="0" />
        ) : null}
      </div>
    </article>
  );
};

function ResourceOverview({
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  displayType = 'cardrow',
  displayBanner = true,
  renderHeader = defaultHeaderRenderer,
  itemsPerPage = 20,
  textResults = 'Dit zijn de zoekresultaten voor [search]',
  onlyIncludeTagIds = '',
  ...props
}: ResourceOverviewWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  // const recourceTagsInclude = only
  const tagIdsToLimitResourcesTo = onlyIncludeTagIds
    .trim()
    .split(',')
    .filter((t) => t && !isNaN(+t.trim()))
    .map((t) => Number.parseInt(t));

  const [open, setOpen] = React.useState(false);
  const [search, setSearchText] = useState<string>('');

  const [resourcesWithPagination] = datastore.useResources({
    ...props,
    itemsPerPage,
    tags: tagIdsToLimitResourcesTo,
  });

  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  const resources = resourcesWithPagination.records || [];

  const [currentUser] = datastore.useCurrentUser({ ...props });
  const isModerator = hasRole(currentUser, 'moderator');

  const onResourceClick = useCallback(
    (resource: any, index: number) => {
      if (displayType === 'cardrow') {
        if (!props.itemLink) {
          console.error('Link to child resource is not set');
        } else {
          location.href = props.itemLink.replace('[id]', resource.id);
        }
      }

      if (displayType === 'cardgrid') {
        setResourceDetailIndex(index);
        setOpen(true);
      }
    },
    [displayType, props.itemLink]
  );

  const filterNeccesary =
    allowFiltering &&
    (props.displaySearch || props.displaySorting || props.displayTagFilters);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        children={
          <Carousel
            startIndex={resourceDetailIndex}
            items={resources && resources.length > 0 ? resources : []}
            itemRenderer={(item) => (
              <GridderResourceDetail
                resource={item}
                isModerator={isModerator}
                loginUrl={props.login?.url}
                onRemoveClick={(resource) => {
                  try {
                    resource
                      .delete(resource.id)
                      .then(() => setOpen(false))
                      .catch((e: any) => {
                        console.error(e);
                      });
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            )}></Carousel>
        }
      />

      <div className="osc">
        {displayBanner ? renderHeader() : null}
        <Spacer size={2} />

        <section
          className={`osc-resource-overview-content ${
            !filterNeccesary ? 'full' : ''
          }`}>
          {props.displaySearchText ? (
            <div className="osc-resourceoverview-search-container col-span-full">
              {props.textActiveSearch && search ? (
                <p className="osc-searchtext">
                  {props.textActiveSearch
                    .replace('[search]', search)
                    .replace('[zoekterm]', search)}
                </p>
              ) : null}
            </div>
          ) : null}

          {filterNeccesary && datastore ? (
            <Filters
              {...props}
              tagsLimitation={tagIdsToLimitResourcesTo}
              itemsPerPage={itemsPerPage}
              projectId={props.projectId}
              resources={resources}
              onUpdateFilter={(f) => {
                setSearchText(f.search.text);
                resources.filter(f);
              }}
            />
          ) : null}

          <section className="osc-resource-overview-resource-collection">
            {resources &&
              resources.map((resource: any, index: number) => {
                return (
                  <React.Fragment key={`resource-item-${resource.title}`}>
                    {renderItem(resource, { ...props, displayType }, () => {
                      onResourceClick(resource, index);
                    })}
                  </React.Fragment>
                );
              })}
          </section>
        </section>
      </div>
    </>
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
