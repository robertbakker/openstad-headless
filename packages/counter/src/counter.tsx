import { loadWidget } from '@openstad-headless/lib/load-widget'
import React, { useEffect, useState } from 'react'
import './counter.css'
import DataStore from '@openstad-headless/data-store/src'
import { BaseProps } from '../../types/base-props'
import { ProjectSettingProps } from '../../types/project-setting-props'

export type CounterWidgetProps = BaseProps &
  CounterProps &
  ProjectSettingProps & {
    resourceId?: string;
  }

export type CounterProps = {
  counterType?: 'resource' | 'vote' | 'votedUsers' | 'static' | 'argument' | 'submission';
  label?: string;
  url?: string;
  opinion?: string;
  amount?: number;
  id?: number;
  choiceGuideId?: string;
}

function Counter({
  counterType = 'vote',
  label = 'Hoeveelheid',
  url = 'https://www.google.com',
  opinion = '',
  amount = 0,
  id = 0,
  choiceGuideId = '1',
  ...props
}: CounterWidgetProps) {
  let amountDisplayed = 0;
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api
  })

  const [resources] = datastore.useResources({
    projectId: props.projectId,
  })

  const [resource] = datastore.useResource({
    projectId: props.projectId,
    resourceId,
  });

  const [comments] = datastore.useCommentsByProject({
    projectId: props.projectId,
    sentiment: opinion
  })

  const [comment] = datastore.useComments({
    projectId: props.projectId,
    resourceId: id,
    sentiment: opinion
  })

  const [results] = datastore.useChoiceGuideResults({
    projectId: props.projectId,
    choiceGuideId: choiceGuideId
  });

  if (counterType === 'resource') {
    amountDisplayed = resources.length;
  }

  if (counterType === 'vote') {
    if (opinion === 'for') {
      amountDisplayed = resource.yes;
    } else if (opinion === 'against') {
      amountDisplayed = resource.no;
    } else {
      amountDisplayed = resource.yes + resource.no;
    }
  }

  if (counterType === 'votedUsers') {
    amountDisplayed = resource.yes + resource.no;
  }

  if (counterType === 'static') {
    amountDisplayed = amount;
  }

  if (counterType === 'argument') {
    if (id > 0) {
      amountDisplayed = comment.length;
    } else {
      amountDisplayed = comments.length;
    }
  }

  if (counterType === 'submission') {
    amountDisplayed = results.length;
  }

  return (
    <div className='osc counter-container'>
      <p>{label}:</p>
      <p className='osc counter-container-amount'>{amountDisplayed}</p>
    </div>
  )
}

Counter.loadWidget = loadWidget;
export { Counter }